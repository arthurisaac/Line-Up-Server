const express = require('express');
const router = express.Router();
const db = require('../database/database');

router.post('/', function (req, res, next) {

    const user = req.body.user;

    const query = `SELECT * FROM notification WHERE user = ${user}`;
    db.query(query, (err, result) => {
        // if (err) throw err;
        res.end(JSON.stringify(result));
    });

});

module.exports = router;
