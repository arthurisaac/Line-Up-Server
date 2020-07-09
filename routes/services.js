const express = require('express');
const router = express.Router();
const db = require('../database/database');
const formidable = require('formidable');
const fs = require('fs');

router.get('/', (req, res) => {

    const todayDate = new Date().toISOString().slice(0, 10);
    const query = `SELECT service.id, service.nom, service.photo, service.temps, service.prefix, COUNT(DISTINCT ticket.id) AS restant
                   FROM service
                            LEFT JOIN ticket ON service.nom = ticket.service AND ticket.etat = 0 AND ticket.created_at BETWEEN '${todayDate}' AND NOW()
                   GROUP BY service.id`;
    db.query(query, (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
});

router.post('/remain', (req, res) => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const desire_service = req.body.service;
    const query = `SELECT COUNT(DISTINCT ticket.id) AS restant
                   FROM service, ticket WHERE service.nom = "${desire_service}" AND ticket.service = service.nom AND ticket.etat = 0 AND ticket.created_at BETWEEN '${todayDate}' AND NOW()`;
    db.query(query, (err, result) => {
        if (err) throw err;
        const restant = {
            restant: result[0].restant
        }
        res.end(JSON.stringify(restant));
    });
});

router.post('/create', (req, res) => {
    const form = formidable({multiples: true});
    form.parse(req, (err, fields, files) => {
        const nom = fields.nom;
        const prefix = fields.prefix;
        const temps = fields.temps;
        let photo = 'default.png';
        if (files.icon) {
            const oldpath = files.icon.path;
            const newpath = 'public/uploads/' + files.icon.name;
            photo = files.icon.name;
            fs.rename(oldpath, newpath, (err) => {
                console.log(err);
            });
        }

        const query = `INSERT INTO service
                       SET nom="${nom}",
                           temps='${temps}',
                           prefix='${prefix}',
                           photo="${photo}"`;
        db.query(query, (err, result) => {
            res.end(JSON.stringify(result));
        });
    });

});

router.post('/update', (req, res) => {
    const form = formidable({multiples: true});
    form.parse(req, (err, fields, files) => {
        const nom = fields.nom;
        const prefix = fields.prefix;
        const temps = fields.temps;
        const id = fields.id;
        let photo = fields.photo;
        if (files.icon) {
            const oldpath = files.icon.path;
            const newpath = 'public/uploads/' + files.icon.name;
            photo = files.icon.name;
            fs.rename(oldpath, newpath, (err) => {
                console.log(err);
            });
        }

        const query = `UPDATE service
                       SET nom="${nom}",
                           temps='${temps}',
                           prefix='${prefix}',
                           photo="${photo}"
                           WHERE id = ${id}`;
        db.query(query, (err, result) => {
            // if (err) throw err;
            res.end(JSON.stringify(result));
        });
    });

});

router.post('/delete', (req, res) => {

    const id = req.body.id;
    const query = `DELETE FROM service WHERE id = ${id}`;
    db.query(query, (err, result) => {
        // if (err) throw err;
        res.end(JSON.stringify(result));
    });
});


module.exports = router;
