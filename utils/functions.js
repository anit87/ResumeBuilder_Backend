const connection = require("./db")

const fetchQuery = function (sqlQuery, data="") {
    return new Promise(async function (resolve, reject) {
        await connection.query(sqlQuery, data, (err, result) => {
            if (err) {
                console.log("Query is:- ", sqlQuery, "   ", data)
                console.log("Error:- ", err)
                // reject(Error("It broke"));
            }
            resolve(result)
        })
    });
};

module.exports = {fetchQuery}