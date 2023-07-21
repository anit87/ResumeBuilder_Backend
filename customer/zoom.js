const express = require("express")
const router = express.Router()
require("dotenv").config()
const { fetchQuery } = require("../utils/functions")
const KJUR = require('jsrsasign')
const axios = require("axios")




function generateSignature(key, secret, meetingNumber, role) {

    const iat = Math.round(new Date().getTime() / 1000) - 30
    const exp = iat + 60 * 60 * 2
    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
        sdkKey: key,
        appKey: key,
        mn: meetingNumber,
        role: role,
        iat: iat,
        exp: exp,
        tokenExp: exp
    }

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, secret)
    return sdkJWT
}


router.post("/zoom", async (req, res) => {
    console.log("zoom - ", req.body);
    const access_token = await generateSignature(process.env.ZOOM_MEETING_CLIENT_ID, process.env.ZOOM_MEETING_CLIENT_SECRET, 123456789, 0)
    console.log("zoom ", access_token);
    res.json({ access_token })
})


router.post("/newmeetingq", async (req, res) => {
    console.log("---------------------------mee");
    email = "anitbusinesswebsoft@gmail.com";
    const options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
        body: {
            topic: "test create meeting",
            type: 1,
            settings: {
                host_video: "true",
                participant_video: "true"
            }
        },
        auth: {
            bearer: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZGtLZXkiOiIwMzNaa1FrU1RWaVdndUxyZ1lZMUEiLCJhcHBLZXkiOiIwMzNaa1FrU1RWaVdndUxyZ1lZMUEiLCJtbiI6MTIzNDU2Nzg5LCJyb2xlIjowLCJpYXQiOjE2ODk5MjA0MjAsImV4cCI6MTY4OTkyNzYyMCwidG9rZW5FeHAiOjE2ODk5Mjc2MjB9.HI8KKjllEOhLrwWEAWJJ2LY2DnZOmAbsTgz0kNKn8AQ"
        },
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json"
        },
        json: true
    };

    await axios(options)
        .then(function (response) {
            console.log("response is: ", response);
            res.send("create meeting result: " + JSON.stringify(response));
        })
        .catch(function (err) {
            // API call failed...
            console.log("API call failed, reason ", err);
        });
});



module.exports = router