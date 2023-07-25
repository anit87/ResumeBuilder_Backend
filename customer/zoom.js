const express = require("express")
const router = express.Router()
require("dotenv").config()
const { fetchQuery } = require("../utils/functions")
const axios = require("axios")
const qs = require('query-string');
const httpErrorHandler = require('../utils/httpErrorHandler');

// Expects express req object as paramter
const logHttpErrorPath = ({ originalUrl, method }) => `${method}: ${originalUrl}`;

const { ZOOM_OAUTH_TOKEN_URL, ZOOM_OAUTH_AUTHORIZATION_URL, ZOOM_API_BASE_URL, ZOOM_TOKEN_RETRIEVED, ZOOM_OAUTH_ERROR } = require('../constants');
const { ZOOM_Account_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL, ZOOM_CLIENT_ID_OAuth, ZOOM_CLIENT_SECRET_OAuth } = process.env;

// Zoom OAuth
router.get('/token', async (req, res) => {
    const { code } = req.query;
    if (code) {
        try {
            const zoomAuthRequest = await axios.post(
                ZOOM_OAUTH_TOKEN_URL,
                qs.stringify({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: ZOOM_REDIRECT_URL,
                }),
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID_OAuth}:${ZOOM_CLIENT_SECRET_OAuth}`).toString('base64')}`,
                    },
                },
            );
            const { access_token, refresh_token } = await zoomAuthRequest.data;
            res.json({ access_token, refresh_token })
        } catch (error) {
            return httpErrorHandler({
                error,
                res,
                customMessage: ZOOM_OAUTH_ERROR,
                logErrorPath: logHttpErrorPath(req),
            });
        }
    } else {
        // Request authorization code in preparation for access token request
        return res.redirect(`${ZOOM_OAUTH_AUTHORIZATION_URL}?${qs.stringify({
            response_type: 'code',
            client_id: ZOOM_CLIENT_ID,
            redirect_uri: ZOOM_REDIRECT_URL,
        })}`);
    }
    return null;
});

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
            topic: "Test Meeting",
            type: 1,
            start_time: "2023-07-26T07:32:55Z",
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

module.exports = router