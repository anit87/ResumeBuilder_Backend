const express = require("express")
const router = express.Router()
require("dotenv").config()
const { response, fetchQuery, sendEmail, zoomToken, createMeeting, } = require("../utils/functions")
const axios = require("axios")
const qs = require('query-string');
const httpErrorHandler = require('../utils/httpErrorHandler');

// Expects express req object as paramter
const logHttpErrorPath = ({ originalUrl, method }) => `${method}: ${originalUrl}`;

const { ZOOM_API_BASE_URL, ZOOM_TOKEN_RETRIEVED, ZOOM_OAUTH_ERROR } = require('../constants');
const { ZOOM_Account_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;



//Zoom Server to Server 
router.post("/zoom", async (req, res) => {
    try {
        const request = await axios.post(
            "https://zoom.us/oauth/token",
            qs.stringify({
                grant_type: 'account_credentials',
                account_id: ZOOM_Account_ID
            }),
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );
        const response = await request.data;
        res.send({ access_token: response.access_token })

    } catch (e) {
        console.error(e?.message, e?.response?.data);
    }

})


router.post("/newmeeting", async (req, res) => {
    try {
        const uri = ZOOM_API_BASE_URL + "/users/me/meetings/"
        const body = {
            topic: "Test Meeting 1",
            type: 1,
            start_time: "2023-08-01T07:32:55Z",
            duration: 10,
            settings: {
                host_video: "true",
                participant_video: "true"
            }
        }
        const headers = {
            Authorization: `Bearer ${req.body.token}`
        }
        const response = await axios.post(uri, body, {
            headers
        })
        res.json(response.data)
    } catch (error) {
        console.log(error);
    }
});

// cust request for meeting
router.post("/requestmeeting", async (req, res) => {
    const checkReq = `SELECT * FROM zoom_meeting WHERE order_id = ? AND approvedStatus=0`
    const alreadyRequested = await fetchQuery(checkReq, req.body.data.order_id)
    if (alreadyRequested.length > 0) {
        res.json(response(400, "Your Request is pending"))
        return
    }

    const query = `INSERT INTO zoom_meeting SET ?`
    const result = await fetchQuery(query, req.body.data)
    if (result) {
        res.json(response(200, "Your Request has been sent"))
    } else {
        res.json(response(200, "Your Request has not been sent"))
    }

})

router.post("/getallmeets", async (req, res) => {
    const query = `SELECT zoom_meeting.*, CT.cust_fname, CT.cust_lname, CT.cust_email, OT.order_number,OT.order_created_at FROM zoom_meeting 
    JOIN customer_table as CT ON zoom_meeting.cust_id = CT.cust_id
    JOIN order_table as OT ON zoom_meeting.order_id = OT.order_id
    where zoom_meeting.order_id = ? ORDER BY meeting_id DESC`

    if (!req.body.order_id) {
        res.status(400).send("Order Number Not Found")
        return
    }
    const result = await fetchQuery(query, req.body.order_id)
    if (result) {
        res.json({ status: true, data: result })
    } else {
        res.json({ status: false, data: "Records not found" })
    }

})

// sendEmail(custEmail, sub, htmlCode).catch(error => console.error(error));

router.post("/approveStatus", async (req, res) => {
    if (!req.body.id) {
        res.status(400).send("ID Not Found")
        return
    }
    const query = `UPDATE zoom_meeting SET 
    approvedStatus = 1, meetingTime = ?, join_url = ?, 	start_url = ?, join_with_id = ?, zoom_password = ? 
    WHERE meeting_id = ?`

    const meetInfo = await createMeeting(req.body.topic, req.body.meetingTime, req.body.duration)

    const data = [req.body.meetingTime, meetInfo.join_url, meetInfo.start_url, meetInfo.id, meetInfo.password, req.body.id]

    const result = await fetchQuery(query, data)

    // topic, start_time, duration

    // custEmail, sub, join_with_id, zoom_password, start_url, meeting_date
    await sendEmail(req.body.cust_email, 'Zoom Meeting', meetInfo.id, meetInfo.password, meetInfo.join_url, req.body.meetingTime).catch(error => console.error(error))

    if (result) {
        res.json({ status: true, message: "Request Approved" })
    } else {
        res.json({ status: false, message: "Request Not Approved" })
    }

})

module.exports = router