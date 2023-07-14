const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")

router.post("/customers", (req, res) => {
    const { action } = req.body
    if (action === "getAllCustomers") {
        connection.query("SELECT * FROM customer_table", function (err, result) {
            if (err) throw err;
            res.send(result)
        });
    }
    if (action === "CustomersStatusChange") {     
        connection.query("UPDATE customer_table SET cust_status = ? WHERE cust_id = ?" ,[req.body.status, req.body.id], function (err, result) {
            if (err) {
                console.log(err);
                res.json({ status: 400, message: "Customer Status fails" })
                return
            };
            res.json({ status: 200, message: "Customer Status Updated" })
        });
    }

})

module.exports = router