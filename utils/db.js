const mysql = require('mysql');
//MySQL details
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resume_builder',
    multipleStatements: true
});

connection.connect((err) => {
    if (!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});
module.exports = connection