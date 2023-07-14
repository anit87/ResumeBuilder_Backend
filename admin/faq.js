const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")

router.post("/faq", (req, res) => {
    const { action } = req.body
    if (action === "addfaq") {
        const { title, description, status } = req.body;
        const data = {
            faq_title: title,
            faq_description: description,
            faq_status: status
        }
        connection.query("INSERT INTO faq SET ?", data, function (err, result) {
            if (err) {
                res.json({ status: 400, data: "Adding Faq Fails" })
            };
            res.json({ status: 200, data: "Success FAQ Added" })
        });
    }
    if (action === "updatefaq") {
        const { title, description, status, id } = req.body;
        const data = {
            faq_title: title,
            faq_description: description,
            faq_status: status,
            faq_id: id
        }
        // UPDATE product SET ? WHERE product_type_id = 2 and product_id = 3
        connection.query("UPDATE faq SET ? WHERE faq_id = ?", [data, id], function (err, result) {
            if (err) {
                res.json({ status: 400, data: "Updating Faq Fails" })
            };
            res.json({ status: 200, data: "Success FAQ Update" })
        });
    }
    if (action === "getallFaq") {
        connection.query("SELECT * FROM faq", function (err, result) {
            if (err) throw err;
            res.send(result)
        });
    }
    if (action === "getActiveFaq") {
        connection.query("SELECT * FROM faq WHERE faq_status = 1", function (err, result) {
            if (err) throw err;
            res.send(result)
        });
    }
    if (action === "getallFaqbyid") {
        connection.query("SELECT * FROM faq WHERE faq_id = ?", req.body.id, function (err, result) {
            if (err) throw err;
            res.send(result)
        });
    }
    if (action === "deletefaq") {
        connection.query("DELETE FROM faq WHERE faq_id = ?", req.body.id, function (err, result) {
            if (err) {
                res.json({ status: 400, message: "Delete Book Fails" })
                return
            };
            res.json({ status: 200, message: "Success Book Deleted" })
        });
    }

})


module.exports = router