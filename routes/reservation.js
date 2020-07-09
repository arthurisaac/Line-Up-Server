const express = require('express');
const router = express.Router();
const db = require('../database/database');
const cron = require('node-cron');

router.get('/', function (req, res, next) {
    cron.schedule('28 * * * *', () => {
        console.log('yes');
    });

    res.end(`${new Date().toLocaleTimeString()} date`);
});


module.exports = router;
