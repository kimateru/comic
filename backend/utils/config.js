const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    // password: process.env.PWD,
    database: process.env.DATABASE,
    port: process.env.PORT
});

db.connect(err => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Connected");
})

module.exports = db;