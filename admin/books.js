const express = require("express")
const multer = require("multer")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")
const { fetchQuery } = require("../utils/functions")


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        cb(null, "Product_Image/" + Date.now() + ' - ' + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.get("/table", (req, res) => {

    let sql = "CREATE TABLE producttable (id INT AUTO_INCREMENT PRIMARY KEY, productname VARCHAR(255), productdescription VARCHAR(255), productamount INT, productsaleamount INT, productimages VARCHAR(255), producttypeid INT, productbookauthor VARCHAR(255), productbookreview VARCHAR(255), productbooktitle VARCHAR(255)";
    connection.query(sql, (err, result) => {
        if (err) {
            console.log("ERR IS ", err);
        }
        res.send({ result })
    })

})

// getBooksProductByID
router.post("/product", async (req, res) => {
    const { action } = req.body

    if (action === "getAllBooks") {
        const query1 = `SELECT * FROM product WHERE product_type_id = ?`
        const query2 = `SELECT * FROM product_image`

        const result = await fetchQuery(query1, 2)
        const resultImages = await fetchQuery(query2, "")

        const updatedArray = result.map(obj => {
            return { ...obj, image: resultImages.filter(image => image.product_id == obj.product_id) };
        });
        res.send(updatedArray)
    }
    if (action === "getBooksProductByID") {
        console.log(req.body);

        const query1 = `SELECT * FROM product WHERE product_type_id = 2 and product.product_id = ?`
        const query2 = `SELECT * FROM product_image WHERE product_id = ?`

        let result = await fetchQuery(query1, req.body.id)
        const resultImages = await fetchQuery(query2, req.body.id)

        result = { ...result[0], image: resultImages }
        res.send(result)
    }
    if (action === "DeleteBooksProduct") {
        connection.query("DELETE FROM product WHERE product_type_id = 2 and product_id = ?", req.body.id, function (err, result) {
            if (err) {
                res.json({ status: 400, message: "Delete Book Fails" })
                return
            };
            res.json({ status: 200, message: "Success Book Deleted" })
        });
    }
    if (action === "DeletePackageProduct") {
        const query = "DELETE FROM product WHERE product_id = ?"
        const result = await fetchQuery(query, req.body.id)
        if (result) {
            await fetchQuery("DELETE FROM product_addons WHERE product_id = ?", req.body.id)

            res.json({ status: 200, message: "Success Book Deleted" })
        } else {
            res.json({ status: 400, message: "Delete Book Fails" })
        }
    }

    if (action === "getAllProduct") {
        const query1 = `SELECT * FROM product`
        const query2 = `SELECT * FROM product_image`

        const result = await fetchQuery(query1, 2)
        const resultImages = await fetchQuery(query2, "")

        const updatedArray = result.map(obj => {
            return { ...obj, image: resultImages.filter(image => image.product_id == obj.product_id) };
        });
        res.send(updatedArray)
    }

})

router.post("/product_image", upload.array("file[]", 5), (req, res) => {
    const { product_name, product_description, product_amount, product_sale_amount, product_images, product_type_id, product_book_author, product_book_review, product_book_title, product_id, action } = req.body
    const images = req.files.map(obj => obj.filename)
    if (action === "AddProduct") {
        const data = {
            product_name,
            product_description,
            product_amount,
            product_sale_amount,
            product_type_id,
            product_book_author,
            product_book_title
        }
        connection.query("INSERT INTO product SET ?", data, (err, result, fields) => {
            if (err) {
                console.log(err);
                res.json({ status: 400, message: "Add Book Fails" })
                return
            }

            const imageQuery = "INSERT INTO product_image SET ?"

            req.files.forEach((data, i) => {
                const newData = {
                    product_id: result.insertId,
                    pd_img_feature_image: data.filename
                }
                connection.query(imageQuery, newData, (errr, ress) => {
                    if (errr) {
                        console.log(i, " - ", err);
                    }
                })
            })
            res.json({ status: 200, message: "Success Add Book" })
        })
    }
    if (action === "UpdateProductImage") {
        // console.log("----",req.files," ***", req.body );
        const data = {
            product_name,
            product_description,
            product_amount,
            product_sale_amount,
            product_type_id,
            product_book_author,
            product_book_title,
            product_id
        }
        connection.query("UPDATE product SET ? WHERE product_type_id = 2 and product_id = ?", [data, product_id], (err, result, fields) => {
            if (err) {
                console.log(err);
                res.json({ status: 400, message: "Update Book Fails" })
                return
            }
            if (req.files.length > 0) {
                const imageQuery = "INSERT INTO product_image SET ?"
                req.files.forEach(async (data, i) => {
                    const newData = {
                        product_id: product_id,
                        pd_img_feature_image: data.filename
                    }
                    await fetchQuery(imageQuery, newData)
                })
            }
            const deleteImg = "DELETE FROM product_image WHERE pd_img_id = ?"
            for (const imgId of req.body.unlinkedimages) {
                new Promise(async (resolve, reject) => {
                    await fetchQuery(deleteImg, imgId)
                });
            }
            res.json({ status: 200, message: "Success Book Updated" })
        })
    }

})

module.exports = router