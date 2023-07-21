const express = require("express")
const router = express.Router()
const multer = require("multer")
require("dotenv").config()
const { fetchQuery } = require("../utils/functions")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        cb(null, "Chat_Image/" + Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage })

router.post("/addChat", upload.array("file[]", 5), async (req, res) => {
    const query = "INSERT INTO chatting SET ?"
    const b = req.body
    const data = {
        order_number: b.order_id,
        chatting_from_user: b.chatting_from_user,
        chatting_to_user: b.chatting_to_user,
        cust_id: b.customer_id,
        chatting_msg_type: "3",
        chatting_msg: "",
        chatting_isread: "0",
        chatting_isdeleted: "0"
    }
    const dataa = []

    Promise.all( 
        await req.files.map(async (imagedata, i) => {
            const result1 = await fetchQuery(query, { ...data, chatting_msg: imagedata.filename })
            dataa.push(result1)
            return dataa
        })
    ).then(result=>res.send(result))
})

router.post("/", async (req, res) => {
    const { action } = req.body
    if (action === "UserChat") {
        const b = req.body
        const query = "INSERT INTO chatting SET ?"
        const data = {
            order_number: b.order_id,
            chatting_from_user: b.chatting_from_user,
            chatting_to_user: b.chatting_to_user,
            cust_id: b.customer_id,
            chatting_msg_type: "1",
            chatting_msg: b.chatting_msg,
            chatting_isread: "0",
            chatting_isdeleted: "0"
        }
        const result = await fetchQuery(query, data)
        res.send(result)
    }
    if (action === "getChatByAdmin") {
        const query = "SELECT * FROM chatting where cust_id = ?"
        console.log(req.body.action);
        res.send("")
    }
    if (action === "getChatByAdmin") {
        const query1 = `SELECT cart.*, p.product_name FROM chatting 
        JOIN product as p ON cart.product_id = p.product_id 
        where cart.cust_id = ? and cart.cart_status = '1'`
        console.log(req.body.action);
        // res.send("")   
    }
    if (action === "DeleteCart") {
        const query = "DELETE FROM chatting WHERE cart_id = ?"
        console.log(req.body.action);
        // let result = await fetchQuery(query)
        res.send("")
    }
    if (action === "OpenChat") {
        const query = "INSERT INTO chatting SET ?"
        console.log(req.body.action);
        res.send("")
    }
    if (action === "getAllChatting") {
        const query = "SELECT * FROM chatting WHERE order_number = ?"
        let result = await fetchQuery(query, req.body.order_id)
        res.send(result)

    }
    if (action === "CombineChats") {
        const query = `SELECT chatting.*, CT.cust_fname, CT.cust_lname FROM chatting
        JOIN customer_table as CT ON chatting.cust_id = CT.cust_id
        WHERE order_number = ?`
        let result = await fetchQuery(query, req.body.order_id)
        res.send(result)
    }
    if (action === "getAllFiles") {
        const query = "SELECT * FROM chatting WHERE order_number = ? AND chatting_msg_type = '3'"
        let result = await fetchQuery(query, req.body.order_id)
        res.send(result)
    }
    if (action === "getAllLinks") {
        const query = "SELECT * FROM chatting WHERE order_number = ? AND chatting_msg_type = '2'"
        let result = await fetchQuery(query, req.body.order_id)
        res.send(result)
    }
})



module.exports = router