const mysql = require('mysql2');

const serverSettings = {
    host: 'localhost',
    user: 'root',
    password: 'Apple12bws',
    database: 'resume_builder',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}

const localhost = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resume_builder',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}

const connection = mysql.createPool(serverSettings);

module.exports = connection;


// connection.connect((err) => {
//     if (!err)
//         console.log('Database Connection Established Successfully');
//     else
//         console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
// });



// const serverSettings1 = {
//     host: 'sql6.freemysqlhosting.net',
//     user: 'sql6638326',
//     password: 'eVWpHDZEDi',
//     database: 'sql6638326',
//     multipleStatements: true
// }