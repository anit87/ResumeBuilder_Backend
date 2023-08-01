const mysql = require('mysql');
//MySQL details
const connection = mysql.createConnection({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6636713',
    password: 'evRTg53LqW',
    database: 'sql6636713',
    multipleStatements: true
});

connection.connect((err) => {
    if (!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});
module.exports = connection