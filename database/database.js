const mysql = require('mysql');

const database = mysql.createConnection({
    host: "fasobizness.com",
    user: "c1292278c_lu",
    password: "Sourir@rt24",
    database: "c1292278c_lu"
    /*host: "localhost",
    user: "root",
    password: "root",
    database: "lineup"*/
});

database.connect(function(err) {
    if (err) throw err;
});

module.exports = database;
