const express = require("express")
const bcrypt = require("bcrypt")
// const jwt = require("jsonwebtoken")
const router = express.Router()
require("dotenv").config()
const saltRounds = 10;
const connection = require("../utils/db")

router.post("/customers", (req, res) => {
    const { first_name, last_name, email, password, action } = req.body

    if (action === "AddNewCustomers") {
        let hashPassword = bcrypt.hashSync(password, saltRounds)
        const data = {
            cust_fname: first_name,
            cust_lname: last_name,
            cust_email: email,
            cust_password: hashPassword,
            cust_status: 1
        }
        const query = "INSERT INTO customer_table SET ?"
        connection.query(query, data, function (err, result) {
            if (err) {
                console.log(err);
                res.json({ message: "Some Error", Status: 404 })
                return
            };
            res.json({ message: "Success", Status: 200 })
        });
    }

    if (action === "loginCustomers") {

        const getEmailQuery = 'SELECT * from customer_table where cust_email = ?'
        connection.query(getEmailQuery, email, function (err, result) {

            if (err || result.length < 1) {
                res.json({ message: "Some Login Error", Status: 401 })
                return
            };
            if (result.length > 0) {
                bcrypt.compare(password, result[0].cust_password, function (err, passwordResult) {
                    if (!passwordResult) {
                        res.json({ message: "Some Login Error", Status: 404 })
                    } else {
                        // console.log(result);
                        res.json({ message: "Login Success", Status: 200, email: result[0].cust_email, userId: result[0].cust_id })
                    }
                });
            };
        });
    }
})
router.post("/login", (req, res) => {
    const { first_name, last_name, email, password, action } = req.body
    // console.log(req.body);
    res.json({ message: "Success", status: 200 })
    const error = false
    // const error = true
    if (action === "AddNewCustomers") {
        if (error) {
            res.json({ message: "Some Error", Status: 404 })
            return
        }

        res.json({ message: "Success", Status: 200 })
    }

    if (action === "loginCustomers") {
        if (error) {
            res.json({ message: "Some Login Error", Status: 404 })
            return
        }

        res.json({ message: "Login Success", Status: 200 })
    }
    if (action === "LOGIN") {
        if (error) {
            res.json({ message: "Some Login Error", Status: 404 })
            return
        }
        // console.log(req.body);

        res.json({ message: "Login Success", status: 200 })
    }

})

module.exports = router