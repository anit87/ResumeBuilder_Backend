const express = require("express")
const router = express.Router()
require("dotenv").config()
const { fetchQuery } = require("../utils/functions")


router.post("/", async (req, res) => {
    const { action } = req.body
    if (action === "AddCart") {
        const { cart_price, cart_qty, customer_id, product_id } = req.body
        const query = "INSERT INTO cart SET ?"
        const data = {
            cust_id: customer_id,
            product_id,
            cart_price,
            cart_qty,
            cart_status: '1'
        }
        const result = await fetchQuery(query, data)
        res.send(result)
    }
    if (action === "getCartItems") {
        const query = "SELECT * FROM cart where cust_id = ?"
        if (!req.body.customer_id) {
            res.send("Customer ID not found")
            return
        }
        const result = await fetchQuery(query, req.body.customer_id)
        res.send(result)
    }
    if (action === "getAllCart") {
        const query = "SELECT * FROM cart where cust_id = ? and cart_status = '1'"
        if (!req.body.customer_id) {
            res.send("Customer ID not found")
            return
        }
        const result = await fetchQuery(query, req.body.customer_id)
        res.send(result)
    }
    if (action === "getCartDetail") {
        const query1 = `SELECT cart.*, p.product_name FROM cart 
        JOIN product as p ON cart.product_id = p.product_id 
        where cart.cust_id = ? and cart.cart_status = '1'`

        const query2 = `SELECT CA.* , addons.addons_name
        FROM cart_addon as CA JOIN addons ON
        CA.addons_id = addons.addons_id where cart_id = ?`

        const query3 = "Select * FROM product_image"

        if (!req.body.customer_id) {
            res.send("Customer ID not found")
            return
        }

        const cartResult = await fetchQuery(query1, req.body.customer_id)
        const images = await fetchQuery(query3)
        Promise.all(
            cartResult.map(async (element) => {
                const image = images.find(data => data.product_id == element.product_id)
                return {
                    ...element,
                    image: image ? image.pd_img_feature_image : null,
                    addons: await fetchQuery(query2, element.cart_id)
                }
            })
        ).then(ress => res.send(ress))
    }
    if (action === "DeleteCart") {
        const query = "DELETE FROM cart WHERE cart_id = ?"
        const query1 = "DELETE FROM cart_addon WHERE cart_id = ?"
        let result = await fetchQuery(query, req.body.cart_id)
        let result1 = await fetchQuery(query1, req.body.cart_id)

        if (result) {
            res.json({ Status: 200, message: "Success " })
        } else {
            res.json({ Status: 400, message: "Deleting Fails" })
        }
    }
    if (action === "AddCartAddons") {
        const { addons, cart_price, customer_id, product_id } = req.body
        const query = "INSERT INTO cart SET ?"
        const query2 = "INSERT INTO cart_addon SET ?"
        const data = {
            cust_id: customer_id,
            product_id,
            cart_price,
            cart_qty: 1,
            cart_status: "1"

        }
        const result = await fetchQuery(query, data)
        if (addons.length > 0) {
            addons.forEach(async element => {
                await fetchQuery(query2, { cart_id: result.insertId, addons_id: element.addonId, addons_price: element.addonPrice })
            });
        }

        if (result) {
            res.json({ Status: 200, message: "Success Cart Added" })
        } else {
            res.json({ Status: 400, message: "Adding Cart Fails" })
        }

    }
    if (action === "UpdateCart") {
        const query = "UPDATE cart SET cart_qty = ? WHERE cart.cart_id = ?"
        req.body.update_qty.forEach(async element => {
            const result = await fetchQuery(query, [element.cart_qty, element.cart_id])
            if (!result) {
                res.send("fails")
                return
            }
        });
        res.send("Cart Updated")
    }
})

router.post("/customer_address_chekout", async (req, res) => {
    const { action } = req.body
    if (action === "AddCustomerAddress") {
        const { address, apartment, city, country, customer_id, email, firstname, lastname, pincode, state } = req.body
        const query = "INSERT INTO customers_address SET ?"
        const data = {
            cust_adrs_address: address + " " + apartment,
            cust_adrs_city: city,
            cust_adrs_country: country,
            cust_id: customer_id,
            cust_adrs_fname: firstname,
            cust_adrs_lname: lastname,
            cust_adrs_pincode: pincode,
            cust_adrs_state: state
        }
        const result = await fetchQuery(query, data)
        res.send(result)
    }
})

router.post("/order_table", async (req, res) => {
    const { action } = req.body
    if (action === "AddCustomerAddress") {
        // console.log("-----app-------", req.body);
        const { address, apartment, city, country, customer_id, email, firstname, lastname, pincode, state } = req.body
        // const query = "Select * FROM order_table Where "

        const result = await fetchQuery(query, data)
        res.send(result)
    }
    if (action === "AddOrder") {
        const { orderDetails, paypalorderid } = req.body
        const [month, date, year] = new Date().toLocaleDateString().split('/');
        const data = {
            cust_id: orderDetails.customer_id,
            order_coupon_name: orderDetails.order_coupon_name,
            order_discount_amount: orderDetails.order_discount_amount,
            order_net_amount: orderDetails.order_net_amount,
            order_subtotal: orderDetails.order_subtotal,
            paypal_order_number: paypalorderid,
            order_number: paypalorderid,
            order_date: year + - +month + - +date
        }
        const query1 = "INSERT INTO order_table SET ?"
        const result = await fetchQuery(query1, data)

        const query2 = `SELECT cart.*, product.* FROM cart
        JOIN product ON product.product_id = cart.product_id`

        const cartresult = await fetchQuery(query2)

        const query3 = "INSERT INTO order_item SET ?"

        orderDetails.crt_id.map(async cart_id => {
            const cart = cartresult.find(obj => obj.cart_id === cart_id)
            const result2 = await fetchQuery(query3, {
                product_id: cart.product_id,
                order_id: result.insertId,
                order_item_qty: cart.cart_qty,
                order_item_product_name: cart.product_name,
                order_item_price: cart.product_amount
            })
            const query4 = `SELECT * From cart_addon
            JOIN addons ON cart_addon.addons_id = addons.addons_id
            WHERE cart_id = ?`
            const cartAddons = await fetchQuery(query4, cart_id)
            cartAddons.map(async orderAddon => {
                const data2 = {
                    cart_addon_id: orderAddon.cart_addon_id,
                    addons_id: orderAddon.addons_id,
                    order_item_id: result2.insertId,
                    order_items_cart_addons_price: orderAddon.addons_price,
                    order_items_cart_addons_name: orderAddon.addons_name
                }
                await fetchQuery('INSERT INTO order_items_cart_addons SET ?', data2)
            })
        })

        res.send(result)
    }
    if (action === "AllOrdersManage") {
        const query = "Select * FROM order_table Where cust_id = ? AND order_status = '1' ORDER BY order_id DESC"

        const query1 = `Select order_item.*, product.product_type_id FROM order_item
        JOIN product ON order_item.product_id = product.product_id
        Where order_id = ?`

        const result = await fetchQuery(query, req.body.customer_id)

        Promise.all(result.map(async order => {
            const result1 = await fetchQuery(query1, order.order_id)
            const isPackage = Boolean(result1.find(el => el.product_type_id == 1))
            return { ...order, prdct_type: isPackage }

        })
        ).then(newResult => res.json({ status: true, result: newResult }))

    }
    if (action === "WriteResume") {
        console.log(req.body);
        res.send({ message: "True" })
    }
    if (action === "PayPalSuccessData") {

        const query = "SELECT * FROM order_table where order_number = ?"
        const result = await fetchQuery(query, req.body.paypalorderid)
        res.send(result)
    }
    if (action === "UpdatePaypalOrder") {
        const removeItemsFromCart = `UPDATE cart set cart_status = '0' Where cart_id = ?`
        
        console.log("UpdatePaypalOrder", req.body);
        const order_status = (req.body.paypalstatus === 'COMPLETED') ? "1" : "0"
        const data = {
            paypal_transaction_id: req.body.paypaltransectionid,
            order_status
        }

        const query = "UPDATE order_table SET ? WHERE paypal_order_number = ?"
        await fetchQuery(removeItemsFromCart, req.body.cartid)
        const result = await fetchQuery(query, [data, req.body.paypalorderid])

        res.send(result)
    }
})

router.post("/user_stepper_form_db", async (req, res) => {
    const b = req.body
    const { action } = b

    if (action === "getAllStepForm") {
        const query = "Select * FROM user_stepper_form Where cust_id = ? and order_number = ?"
        const result = await fetchQuery(query, [req.body.cust_id, req.body.order_id])
        res.send(result)
    }
    if (action === "NewStepFormUser") {

        const data = {
            cust_id: b.cust_id,
            order_number: b.order_id,
            stepfrm_name: b.name,
            stepfrm_lName: b.lName,
            stepfrm_email: b.email,
            stepfrm_address: b.address,
            stepfrm_appartment: b.appartment,
            stepfrm_city: b.city,
            stepfrm_postal_code: b.postal_code,
            stepfrm_country: b.country,
            stepfrm_phone: b.phone,
            stepfrm_linkeDin: b.linkeDin,
            stepfrm_institute: b.institude,
            stepfrm_location: b.location,
            stepfrm_degree: b.degree,
            stepfrm_concentration: b.concentration,
            stepfrm_start_date: b.startDate,
            stepfrm_toend_date: b.toEnd,
            stepfrm_graduation: b.graduation,
            stepfrm_graduation_date: b.graduation_date,
            stepfrm_company_name: b.company_name,
            stepfrm_company_address: b.company_address,
            stepfrm_date_of_form: b.date_of_form,
            stepfrm_toemployment: b.ToEmployment,
            stepfrm_job_title: b.job_title,
            stepfrm_direct_report: b.direct_report,
            stepfrm_description: b.description,
            stepfrm_techinical_skill: b.techinical_skill,
            stepfrm_other_info: b.other_info,
            stepfrm_updated_at: new Date()
        }
        const query = 'INSERT INTO user_stepper_form SET ?'
        const result = await fetchQuery(query, data)
        res.json({Status:200,message:"Saved Successfully"})
    }
    if (action === "getStepFormByID") {
        const query = `SELECT * FROM user_stepper_form where order_number = ?`
        if (!req.body.order_id) {
            res.status(404).send("Order Id is not Found")
        } else {
            const result = await fetchQuery(query, req.body.order_id)
            res.send(result)
        }
    }
    if (action === "UpdateStepForm") {
        const query = `UPDATE user_stepper_form SET
        stepfrm_name = ?, stepfrm_lName = ?, stepfrm_email = ?, stepfrm_address = ?, stepfrm_appartment = ?, stepfrm_city = ?, stepfrm_postal_code = ?, stepfrm_country = ?, stepfrm_phone = ?, stepfrm_linkeDin = ?,
        stepfrm_institute = ?, stepfrm_location = ?, stepfrm_degree = ?, stepfrm_concentration = ?, stepfrm_start_date = ?, stepfrm_toend_date = ?, stepfrm_graduation = ?, stepfrm_graduation_date = ?,
        stepfrm_company_name = ?, stepfrm_company_address = ?, stepfrm_date_of_form = ?, stepfrm_toemployment = ?, stepfrm_job_title = ?, stepfrm_direct_report = ?, stepfrm_description = ?,
        stepfrm_techinical_skill = ?, stepfrm_other_info = ?, stepfrm_updated_at= ? WHERE order_number = ?`
        const data = [
            b.name,
            b.lName,
            b.email,
            b.address,
            b.appartment,
            b.city,
            b.postal_code,
            b.country,
            b.phone,
            b.linkeDin,
            b.institude,
            b.location,
            b.degree,
            b.concentration,
            b.startDate,
            b.toEnd,
            b.graduation,
            b.graduation_date,
            b.company_name,
            b.company_address,
            b.date_of_form,
            b.ToEmployment,
            b.job_title,
            b.direct_report,
            b.description,
            b.techinical_skill,
            b.other_info,
            new Date(),
            b.order_id
        ]
        // console.log("update form");
        const result = await fetchQuery(query, data)
        if (result) {
            res.status(200).json({ Status: 200, message: "Update Successfully" })
        } else {
            res.status(400).json({ message: "Update Not Success" })
        }

    }
})


module.exports = router