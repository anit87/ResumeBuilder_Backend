// const mysql = require('mysql');
const express = require('express')
const cors = require('cors')
const app = express()
const authRouter = require("./auth/auth")
const booksRouter = require("./admin/books")
const faqRouter = require("./admin/faq")
const packagesRouter = require("./admin/packages")
const customersRouter = require("./admin/customers")
const ordersRouter = require("./admin/orders")
const chattingRouter = require("./admin/chatting")
const cartRouter = require("./customer/cart")
const reviewRouter = require("./customer/review")
const chatRouter = require("./customer/chatting")
const zoomRouter = require("./customer/zoom")
const connection = require("./utils/db")
const { fetchQuery, sendEmail } = require("./utils/functions")
require("dotenv").config()
const port = 4000
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(express.static('Templates'))


app.use("/", authRouter)
app.use("/admin", booksRouter)
app.use("/admin", faqRouter)
app.use("/admin", packagesRouter)
app.use("/admin", customersRouter)
app.use("/admin", ordersRouter)
// app.use("/admin", chattingRouter)
app.use("/cart", cartRouter)
app.use("/review", reviewRouter)
app.use("/chatting", chatRouter)
app.use("/", zoomRouter)

app.get("/", (req, res) => {
    console.log("env - ", process.env.testenv)
    connection.query("select * from faq", (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result)
    })
})

app.post("/recaptcha", async (req, res) => {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${"6Lc79fAiAAAAANgmO4wKjAsKbKCa3LMNDFTDMwgn"}&response=${req.body.id}`

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            console.error('Error making POST request:', error);
        });

})

// custEmail, sub, join_with_id, zoom_password, start_url, meeting_date
// sendEmail("goyalanit07@gmail.com", 'Zoom Meeting', "1234", "admin@1234", "https://www.google.com/", "9:00 am").catch(error => console.error(error))

app.post("/mailData", async (req, res) => {
    const result = await fetchQuery("INSERT INTO mail_data SET ?", req.body)
    if (result) {
        res.json({ status: true, message: "Your Form is submitted" })
    }else {
        res.json({ status: false, message: "Please Send Again" })
    }
})

app.listen(port, () => console.log(`Listening on port ${port}..`)); 