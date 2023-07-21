const express = require("express")
const router = express.Router()
require("dotenv").config()
const { fetchQuery } = require("../utils/functions")

router.post("/faq", async (req, res) => {
    const { action } = req.body
    if (action === "addfaq") {
        const { title, description, status } = req.body;
        const data = {
            faq_title: title,
            faq_description: description,
            faq_status: status.toString() || "1"
        }
        const result = await fetchQuery("INSERT INTO faq SET ?", data)
        if (result) {
            res.json({ status: 200, data: "Success FAQ Added" })
        } else {
            res.json({ status: 400, data: "Adding Faq Fails" })
        }
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
        const result = await fetchQuery("UPDATE faq SET ? WHERE faq_id = ?", [data, id])
        if (result) {
            res.json({ status: 200, data: "Success FAQ Update" })
        } else {
            res.json({ status: 400, data: "Updating Faq Fails" })
        }

    }
    if (action === "getallFaq") {
        const result = await fetchQuery("SELECT * FROM faq")
        res.send(result)
    }
    if (action === "getActiveFaq") {
        const query = "SELECT * FROM faq WHERE faq_status = '1'"
        const result = await fetchQuery(query);
        res.send(result);
    }
    if (action === "getallFaqbyid") {
        const result = await fetchQuery("SELECT * FROM faq WHERE faq_id = ?", req.body.id)
        res.send(result)
    }
    if (action === "deletefaq") {
        const result = await fetchQuery("DELETE FROM faq WHERE faq_id = ?", req.body.id)
        if (result) {
            res.json({ status: 200, message: "Success Book Deleted" })
        } else {
            res.json({ status: 400, message: "Delete Book Fails" })
        }
    }

})


module.exports = router