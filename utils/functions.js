const connection = require("./db")
require("dotenv").config()
const axios = require("axios")
const qs = require('query-string');
const { ZOOM_Account_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
const { ZOOM_API_BASE_URL } = require('../constants');

const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

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
            reject(Error("Token Error ", error.message));
        }
    });
};
const createMeeting = async function (topic, start_time, duration) {
    return new Promise(async function (resolve, reject) {
        try {
            const token = await zoomToken()
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
                Authorization: `Bearer ${token.access_token}`
            }
            const response = await axios.post(uri, body, {
                headers
            })
            resolve(response.data)
        } catch (error) {
            console.log("Error in Meeting", error.message);
            reject(Error(error.message));
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

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))


async function sendEmail(custEmail, sub, join_with_id, zoom_password, start_url, meeting_date) {
    const info = await transporter.sendMail({
        from: `"Flawless Resume Team" <${process.env.ADMIN_EMAIL}>`,
        to: custEmail,
        subject: sub,
        template: 'zoomTemplate', // the name of the template file i.e email.handlebars
        context: {
            join_with_id,
            zoom_password,
            start_url,
            meeting_date
        }
    });
    console.log("Message sent: %s", info.messageId);
}


module.exports = { response, fetchQuery, sendEmail, zoomToken, createMeeting }