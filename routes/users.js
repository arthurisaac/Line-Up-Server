const express = require('express');
const router = express.Router();
const db = require('../database/database');

router.post('/login', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    const query_service = `SELECT * FROM users WHERE email LIKE "${email}" AND password = "${password}"`;
    db.query(query_service, (err, result) => {
        if (err) throw err;
            if (result.length > 0) {
                const user = {
                    user: result[0]
                }
                res.end(JSON.stringify(user));
            } else {
                res.end(JSON.stringify(result));
            }

    });
});

router.post('/', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const tel = req.body.tel;
    const data = { user_exist: false };

    const q_exist = `SELECT * FROM users WHERE email LIKE "${email}"`;
    db.query(q_exist, (err, result) => {
        if (result.length > 0 ) {
            data.user_exist = true;
            res.end(JSON.stringify(data));
        } else {
            const query_service = `INSERT INTO users SET email = "${email}", password = "${password}", tel = "${tel}"`;
            db.query(query_service, (err, result) => {
                if (err) throw err;
                const q_user = `SELECT * FROM users WHERE email LIKE "${email}"`;
                db.query(q_user, (err, result) => {
                    const user = {
                        user: result[0]
                    }
                    const response = {...data, ...user};
                    res.end(JSON.stringify(response));
                });
            });
        }
    });
});

// TODO: user update

module.exports = router;
