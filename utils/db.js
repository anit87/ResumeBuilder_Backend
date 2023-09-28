const mysql = require('mysql2');

const serverSettings = {
    host: 'localhost',
    user: 'root',
    password: 'Apple12bws',
    database: 'resume_builder'
}

//MySQL details
const localhost = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resume_builder'
}

const serverSettings1 = {
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6638326',
    password: 'eVWpHDZEDi',
    database: 'sql6638326',
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