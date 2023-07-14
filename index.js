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
const connection = require("./utils/db")

const port = 4000
app.use(cors())
app.use(express.json())
app.use(express.static('public'))


app.use("/", authRouter)
app.use("/admin", booksRouter)
app.use("/admin", faqRouter)
app.use("/admin", packagesRouter)
app.use("/admin", customersRouter)
app.use("/admin", ordersRouter)
app.use("/admin", chattingRouter)
app.use("/cart", cartRouter)
app.use("/review", reviewRouter)

app.get("/",(req,res)=>{
    console.log("-----app-------");
    connection.query("select * from faq", (err, result)=>{
        if (err){
            console.log(err);
        }
        res.send(result)
    })
})


app.listen(port, () => console.log(`Listening on port ${port}..`)); 