const express = require("express")
const router = express.Router()
require("dotenv").config()
const connection = require("../utils/db")
const { fetchQuery } = require("../utils/functions")

router.post("/", async (req, res) => {
    const { action } = req.body
    const reviwQuery = "SELECT * FROM reviews where product_id = ? and review_rating = ?"

    if (action === "getReviewProductByID") {
        const query = "SELECT * FROM reviews where product_id = ?"
        const result = await fetchQuery(query, req.body.product_id)
        res.send(result)
    }
    if (action === "getFiveStarReviewProduct") {
        const result = await fetchQuery(reviwQuery, [req.body.product_id, 5])
        res.send(result)
    }
    if (action === "getFourStarReviewProduct") {
        const result = await fetchQuery(reviwQuery, [req.body.product_id, 4])
        res.send(result)
    }
    if (action === "getThreeStarReviewProduct") {
        const result = await fetchQuery(reviwQuery, [req.body.product_id, 3])
        res.send(result)
    }
    if (action === "getTwoStarReviewProduct") {
        const result = await fetchQuery(reviwQuery, [req.body.product_id, 2])
        res.send(result)
    }
    if (action === "getOneStarReviewProduct") {
        const result = await fetchQuery(reviwQuery, [req.body.product_id, 1])
        res.send(result)
    }
    if (action === "SumOftReviewProduct") {
        const query = "SELECT * FROM reviews where product_id = ?"
        const result = await fetchQuery(query, req.body.product_id)
        res.send(result)
    }
    if (action === "AddNewReview") {
        const {reviews, customer_id, product_id, review_rating } = req.body
        const query = "INSERT INTO reviews SET ?"
        console.log(req.body);
        const data = {
            product_id,
            review_rating,
            cust_id: customer_id,
            review_body:reviews.review_body,
            review_name:reviews.review_name

        }
        const result = await fetchQuery(query, data)
        console.log("res ",result);
        res.json({Status:200,message: "Review Added"})
    }
})

// {
//     "action": "AddNewReview",
//     "reviews": {
//         "review_name": "testuser11",
//         "review_body": "The Enchanted Forest\" by [Author's Name] is a mesmerizing tale that transports readers into a world of magic, wonder, and self-discovery. From the very first page, I was captivated by the author's vivid descriptions and engaging storytelling, which effortlessly drew me into the heart of the story."
//     },
//     "customer_id": "7",
//     "product_id": 29,
//     "review_rating": 4
// }


module.exports = router