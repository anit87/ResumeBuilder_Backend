const connection = require("./db")
const nodemailer = require("nodemailer");
require("dotenv").config()
const axios = require("axios")
const qs = require('query-string');
const { ZOOM_Account_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
const { ZOOM_API_BASE_URL } = require('../constants');

const response = (status, message) => ({ status, message })

const fetchQuery = function (sqlQuery, data = "") {
    return new Promise(async function (resolve, reject) {
        connection.query(sqlQuery, data, (err, result) => {
            if (err) {
                console.log("Query is:- ", sqlQuery, "   ", data)
                console.log("Error:- ", err)
                // reject(Error(err));
            }
            resolve(result)
        })
    });
};

const zoomToken = function () {
    return new Promise(async function (resolve, reject) {
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
            resolve({ access_token: response.access_token })
        } catch (error) {
            reject(Error(error));
        }
    });
};
const createMeeting =async function (topic, start_time, duration ) {
    return new Promise(async function (resolve, reject) {
        console.log("48 ---- ",topic, start_time, duration);
        try {
            const token = await zoomToken()
            console.log("51 ", token);
            const uri = ZOOM_API_BASE_URL + "/users/me/meetings/"
            const body = {
                topic,
                type: 1,
                start_time,
                duration,
                settings: {
                    host_video: "true",
                    participant_video: "true"
                }
            }
            const headers = {
                Authorization: `Bearer ${token}`
            }
            const response = await axios.post(uri, body, {
                headers
            })
            console.log("70 ", response);
            resolve(response)
        } catch (error) {
            reject(Error(error));
        }
    });
};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: 'jkxdbdwwcblcpkkp'
    }
});
async function sendEmail(custEmail, sub, htmlCode) {
    const info = await transporter.sendMail({
        from: `"Flawless Resume Team" <${process.env.ADMIN_EMAIL}>`,
        to: custEmail,
        subject: sub, // Subject line
        html: htmlCode, // html body
    });
    console.log("Message sent: %s", info.messageId);
}


module.exports = { response, fetchQuery, sendEmail, zoomToken, createMeeting }