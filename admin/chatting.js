const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")

router.post("/chatting", async (req, res) => {
    const { action } = req.body
    console.log(req.body);
    if (action === "getAllChatting") {
        const query = "SELECT * FROM chatting Where order_number= ?"
        connection.query(query, req.body.order_id, function (err, result) {
            if (err) throw err;
            res.send(result)
        });
    }
})


module.exports = router