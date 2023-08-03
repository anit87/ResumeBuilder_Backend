const mysql = require('mysql');
//MySQL details
const localhost = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resume_builder',
    multipleStatements: true
}

const serverSettings = {
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6636713',
    password: 'evRTg53LqW',
    database: 'sql6636713',
    multipleStatements: true
}

const connection = mysql.createConnection(serverSettings);

connection.connect((err) => {
    if (!err)
        console.log('Database Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});
module.exports = connection