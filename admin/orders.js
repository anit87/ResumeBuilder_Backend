const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")
const { fetchQuery } = require("../utils/functions")

router.post("/order_table", async (req, res) => {
    const { action } = req.body
    if (action === "AdminOrder") {
        const query = `SELECT ct.cust_fname, ct.cust_lname, ct.cust_email, ot.* FROM order_table as ot 
        JOIN customer_table as ct ON ot.cust_id=ct.cust_id ORDER BY order_id DESC`

        const result = await fetchQuery(query)
        res.send(result)
    }
    if (action === "AdminOrderInnerData") {
        const query = `SELECT ot.*, ct.cust_id, ct.cust_fname, ct.cust_lname
        FROM order_table as ot 
        JOIN customer_table as ct ON ot.cust_id=ct.cust_id
        where ot.order_id= ?`

        const query2 = `SELECT * from order_item where order_id = ?`
        const query3 = `SELECT * from order_items_cart_addons where order_item_id = ?`

        if (!req.body.order_id) {
            res.status(404).send("Order Id is not Found")
            return
        }

        const result = await fetchQuery(query, req.body.order_id)

        const result2 = await fetchQuery(query2, req.body.order_id)

        Promise.all(
            result2.map(async item => {
                const addons = await fetchQuery(query3, item.order_item_id)
                return (
                    { ...result[0], ...item, addons }
                )
            })
        ).then(arr => res.send(arr))

    }
    if (action === "UpdateOrderStatus") {
        const query = `UPDATE order_table SET order_status = ? WHERE order_id = ?`
        const result = await fetchQuery(query, [req.body.order_status, req.body.id])
        
        if (result) {
            res.json({ status: 200, message: "Order Status Updated" })
        } else {
            res.json({ status: 400, message: "Updating Order Status Fails" })
        }

        // connection.query(query, [req.body.order_status, req.body.id], function (err, result) {
        //     if (err) {
        //         console.log(err);
        //         res.json({ status: 400, message: "Updating Order Status Fails" })
        //         return
        //     };
        //     res.json({ status: 200, message: "Order Status Updated" })
        // });
    }

})


module.exports = router