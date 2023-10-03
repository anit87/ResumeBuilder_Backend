const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")
const { fetchQuery } = require("../utils/functions")

router.post("/package", (req, res) => {
    const { action } = req.body
    try {
        if (action === "UpdateProductPackageAddon") {
            const { name, price, id } = req.body;
            const data = {
                addons_name: name,
                addons_price: price,
                addons_id: id
            }

            connection.query("UPDATE addons SET ? WHERE addons_id = ?", [data, id], function (err, result) {
                if (err) {
                    res.json({ Status: 400, message: "Updating Addons Fails" })
                };
                res.json({ Status: 200, message: "Success Addons Update" })
            });
        }
        if (action === "DeleteAddons") {
            connection.query("DELETE FROM addons WHERE addons_id = ?", req.body.id, function (err, result) {
                if (err) {
                    res.json({ status: 400, message: "Delete Book Fails" })
                    return
                };
                res.json({ status: 200, message: "Success Book Deleted" })
            });
        }
    } catch (error) {
        console.log(error.message);
    }
})

router.post("/product_package_addon", async (req, res) => {
    const { action } = req.body
    try {
        if (action === "AddProductPackageAddon") {
            const { product_name, product_description, product_amount, product_sale_amount, product_type_id } = req.body.PackageData;
            const data = {
                product_name,
                product_description,
                product_amount,
                product_sale_amount,
                product_type_id
            }
            const query1 = "INSERT INTO product SET ?";
            const query2 = "INSERT INTO product_addons SET ?";

            let result = await fetchQuery(query1, data)
            if (result) {
                req.body.Addons.forEach(async (addons_id, i) => {
                    await fetchQuery(query2, { product_id: result.insertId, addons_id })
                });
                res.json({ Status: 200, message: "Success Addons Added" })
            } else {
                res.json({ Status: 400, message: "Adding Addons Fails" })
            }
        }
        if (action === "UpdateProductPackageAddon") {
            const { product_name, product_description, product_amount, product_sale_amount, product_type_id, product_id } = req.body.PackageData;
            const data = {
                product_name,
                product_description,
                product_amount,
                product_sale_amount,
                product_type_id,
                product_id
            }
            const query1 = "UPDATE product SET ? WHERE product_id = ?"
            const query2 = "DELETE FROM product_addons WHERE product_id = ?"
            const query3 = "INSERT INTO product_addons SET ?"

            const result = await fetchQuery(query1, [data, product_id])
            const result2 = await fetchQuery(query2, product_id)

            if (result && result2) {
                req.body.Addons.forEach(async (addons_id, i) => {
                    await fetchQuery(query3, { product_id, addons_id })
                });
                res.json({ Status: 200, message: "Success Package Updated" })
            } else {
                res.json({ Status: 400, message: "Updating Package Fails" })
            }
        }
        if (action === "getAllProductPackageAddon") {
            const query1 = "SELECT * FROM product WHERE product_type_id = 1"
            // const query2 ="SELECT * FROM product_addons"
            const query2 = `SELECT pa.*, addons.* 
        FROM product_addons as pa 
        JOIN addons ON pa.addons_id = addons.addons_id`
            const result = await fetchQuery(query1)
            const resultAddons = await fetchQuery(query2)

            const updatedArray = result.map(obj => {
                return { ...obj, addons: resultAddons.filter(addon => addon.product_id == obj.product_id) };
            });

            res.send(updatedArray)

        }
        if (action === "getProductPackageAddonByID") {
            const query1 = "SELECT * FROM product WHERE product_id = ?"
            const query2 = `SELECT pa.*, addons.addons_name 
        FROM product_addons as pa 
        JOIN addons ON pa.addons_id = addons.addons_id 
        WHERE pa.product_id = ?`

            let result = await fetchQuery(query1, req.body.id)
            const resultAddons = await fetchQuery(query2, req.body.id)

            result = { ...result[0], package_addons: resultAddons }
            // console.log(result);
            res.send(result)
        }
        if (action === "DeleteAddons") {
            connection.query("DELETE FROM product WHERE product_id = ?", req.body.id, async function (err, result) {
                if (err) {
                    res.json({ status: 400, message: "Delete Package.. Fails" })
                    return
                };
                await fetchQuery("DELETE FROM product_addons WHERE product_id = ?", req.body.id)
                res.json({ status: 200, message: "Success Package.. Deleted" })
            });
        }
    } catch (error) {
        console.log("Error is ", error.message);
    }
})

router.post("/addons", (req, res) => {
    const { action } = req.body
    try {
        if (action === "AddAddons") {
            const { name, price } = req.body;
            const data = {
                addons_name: name,
                addons_price: price,
            }
            connection.query("INSERT INTO addons SET ?", data, function (err, result) {
                if (err) {
                    res.json({ Status: 400, message: "Adding Addons Fails" })
                    return
                };
                res.json({ Status: 200, message: "Success Addons Added" })
            });
        }
        if (action === "UpdateAddons") {
            const { name, price, id } = req.body;
            const data = {
                addons_name: name,
                addons_price: price,
                addons_id: id
            }

            connection.query("UPDATE addons SET ? WHERE addons_id = ?", [data, id], function (err, result) {
                if (err) {
                    res.json({ Status: 400, message: "Updating Addons Fails" })
                };
                res.json({ Status: 200, message: "Success Addons Update" })
            });
        }
        if (action === "getAllAddons") {
            connection.query("SELECT * FROM addons", function (err, result) {
                if (err) throw err;
                res.send(result)
            });
        }
        if (action === "getAddonsByID") {
            connection.query("SELECT * FROM addons WHERE addons_id = ?", req.body.id, function (err, result) {
                if (err) throw err;
                res.send(result)
            });
        }
        if (action === "DeleteAddons") {
            connection.query("DELETE FROM addons WHERE addons_id = ?", req.body.id, function (err, result) {
                if (err) {
                    res.json({ status: 400, message: "Delete Book Fails" })
                    return
                };
                res.json({ status: 200, message: "Success Book Deleted" })
            });
        }
    } catch (error) {
        console.log(error.message);
    }

})

module.exports = router