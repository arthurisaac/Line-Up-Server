const express = require('express');
const router = express.Router();
const db = require('../database/database');
const cron = require('node-cron');

router.post('/take', function (req, res, next) {
    // www.setBorne('ticket');

    let queue_number = 0;
    let prefix = null;
    let photoURL = null;

    // Get last of desire service
    const desire_service = req.body.service;
    const user = req.body.user;
    const todayDate = new Date().toISOString().slice(0, 10);

    // Get service prefix
    const query_service = `SELECT prefix FROM service s WHERE nom LIKE "${desire_service}"`;
    db.query(query_service, (err, result) => {
        // if (err) throw err;
        if (result.length > 0) {
            prefix = result[0].prefix;
        }
    });

    const query = `SELECT numero, service, prefix, photo 
                    FROM ticket, service s 
                    WHERE ticket.service = s.nom AND ticket.service LIKE "${desire_service}" AND ticket.created_at BETWEEN '${todayDate}' AND NOW() 
                    ORDER BY ticket.id DESC LIMIT 1`;
    db.query(query, (err, result) => {
        // if (err) throw err;

        const code = (Math.floor(Math.random() * 1000) + 1);
        if (result.length === 0) {
            queue_number = 0;
        } else {
            queue_number = result[0].numero;
            queue_number++;
            photoURL = result[0].photo;
        }

        const query = `INSERT INTO ticket SET numero='${queue_number}', service="${desire_service}", code='${code}'`;
        db.query(query, (err, result) => {
            if (err) throw err;
            let full_queue_number = queue_number;
            if (prefix != null) {
                full_queue_number = prefix + queue_number;
            }
            const idTK = result.insertId;

            const query = `SELECT COUNT(DISTINCT ticket.id) AS restant
                   FROM service, ticket WHERE service.nom = "${desire_service}" AND ticket.service = service.nom AND ticket.etat = 0 AND ticket.created_at BETWEEN '${todayDate}' AND NOW()`;

            db.query(query, (err, result) => {
                // if (err) throw err;
                // res.end(JSON.stringify(result));
                const restant = result[0].restant;
                let estimation = (5 * 60000) * restant;
                const response = {
                    id: idTK,
                    number: full_queue_number,
                    estimation: estimation,
                    service: desire_service,
                    restant: restant,
                    code: code
                };

                console.log(estimation);
                let t = new Date();
                t.setMilliseconds(estimation);
                let d = new Date(t.getTime() - 5 * 60000);
                console.log(d);

                cron.schedule(`${d.getMinutes()} ${d.getHours()} * * *`, () => {
                    addNotification("Vous passerai bientot", ticket);
                });
                res.end(JSON.stringify(response));
            });

            // res.end("No ticket " + result.insertId);
        });

    });

    function addNotification(message, ticket) {
        const query = `INSERT INTO notification (type, logo, message, user, numero) VALUES ('ticket', "${photoURL}", "${message}", ${user}, '${ticket}')`;
        db.query(query, (err, result) => {
            if (err) throw err;
        });
    }
});

router.post('/current-ticket', function (req, res) {
    const todayDate = new Date().toISOString().slice(0, 10);
    const service = req.body.service;
    const details_service = {nom: '', prefix: '', temps: ''};
    let queue_number = 0;
    let prefix = null;

    const query = `SELECT nom, prefix, temps 
                    FROM service 
                    WHERE nom LIKE "${service}"`;
    db.query(query, (err, result) => {
        // res.end(JSON.stringify(result));
        details_service.nom = result[0].nom;
        details_service.prefix = result[0].prefix;
        details_service.temps = result[0].temps;
        prefix = result[0].prefix;

        const q = `SELECT numero, service, prefix, (SELECT COUNT(ticket.id)
                                                    FROM ticket, service s 
                                                    WHERE ticket.service = s.nom AND s.nom = '${service}' AND ticket.created_at BETWEEN '${todayDate}' AND NOW() AND etat = 0  
                                                    ORDER BY ticket.id LIMIT 1) AS remain 
                    FROM ticket, service s 
                    WHERE ticket.service = s.nom AND ticket.service LIKE "${service}" AND ticket.created_at BETWEEN '${todayDate}' AND NOW() 
                    ORDER BY ticket.id DESC LIMIT 1`;
        db.query(q, (err, result) => {

            if (err) throw err;

            let remain = 0;
            if (result.length === 0) {
                queue_number = 0;
            } else {
                queue_number = result[0].numero;
                queue_number++;
                remain = result[0].remain;
            }
            const estimation = details_service.temps * remain;
            let full_queue_number = queue_number;
            if (prefix != null) {
                full_queue_number = prefix + queue_number;
            }
            let current_ticket = {numero: full_queue_number, estimation: estimation, remain: remain};
            const full_details = {...details_service, ...current_ticket};

            res.end(JSON.stringify(full_details));

        });

    })
});

router.post('/next-ticket', function (req, res) {
    const service = req.body.service;
    const guichet = req.body.guichet;
    const todayDate = new Date().toISOString().slice(0, 10);

    let query = '';
    if (service === 'any') {
        query = `SELECT ticket.id, numero, service, prefix 
                    FROM ticket, service s 
                    WHERE ticket.service = s.nom AND ticket.created_at BETWEEN '${todayDate}' AND NOW() AND etat = 0  
                    ORDER BY ticket.id LIMIT 1`
    } else {
        query = `SELECT ticket.id, ticket.numero, ticket.service, prefix, COUNT(DISTINCT ticket.id) AS restant
                    FROM ticket, service s 
                    WHERE ticket.service = s.nom AND ticket.service LIKE "${service}" AND ticket.created_at BETWEEN '${todayDate}' AND NOW() AND etat = 0
                    ORDER BY ticket.id  LIMIT 1`;
    }

    db.query(query, (err, result) => {
        if (result.length === 0) {
            res.end(JSON.stringify(result));
        } else {
            const id = result[0].id;
            const ticket_number = result[0].prefix + result[0].numero;
            const ticket_service = result[0].service;
            /*www.setBorne('ticket');
            www.setBorne('call', {guichet: guichet, numero: ticket_number, service: ticket_service});*/
            const query_update_ticket = `UPDATE ticket SET etat=1, guichet=${guichet} WHERE id=${id}`;
            db.query(query_update_ticket, () => {
                res.end(JSON.stringify(result));
            });
        }
    });
});

router.post('/save-ticket', function (req, res) {

    const agence = req.body.agence;
    const service = req.body.service;
    const url = req.body.url;
    const photoURL = req.body.photoURL;
    const code = req.body.code;
    const ticket = req.body.ticket;
    const idTK = req.body.idTk;
    const expire = req.body.expire;
    const picked = req.body.picked;
    const user = req.body.user;

    if (user !== undefined) {
        const query = `INSERT INTO user_ticket (agence, service, url, photoURL, code, ticket, idTK, expire, picked, user)  VALUES ("${agence}", "${service}", "${url}", "${photoURL}", "${code}", "${ticket}", '${idTK}', "${expire}", "${picked}", ${user})`;
        db.query(query, (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    } else {
        res.statusCode = 503;
        res.end(JSON.stringify({error: 'Not authorized'}));
    }
});

router.post('/my-tickets', function (req, res) {
    const user = req.body.user;
    const query = `SELECT * FROM user_ticket, ticket WHERE user_ticket.ticket = ticket.id AND user = ${user} AND ticket IS NOT NULL AND DATE_ADD(ticket.created_at, INTERVAL 1 DAY) > NOW() ORDER BY id DESC`;
    db.query(query, (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
    })
});

router.post('/reservation', function (req, res) {
    const agence = req.body.agence;
    const service = req.body.service;
    const url = req.body.url;
    const photoURL = req.body.photoURL;
    const expire = req.body.expire;
    const picked = req.body.picked;
    const user = req.body.user;
    const reservation = req.body.reservation;

    const query = `INSERT INTO user_ticket (agence, service, url, photoURL, expire, picked, user, reservation)  VALUES ("${agence}", "${service}", "${url}", "${photoURL}", "${expire}", "${picked}", ${user}, "${reservation}")`;
    db.query(query, (err, result) => {
        if (err) throw err;
        // schedule notification
        const idUTK = result.insertId;
        let t = new Date(reservation);
        let d = new Date(t.getTime() - 5 * 60000);

        let hh = d.getHours();
        let mm = d.getMinutes();
        cron.schedule(`${mm} ${hh} * * *`, () => {
            console.log('taking ticket');
            takeTicket(service, idUTK);
        });
        //
        res.end(JSON.stringify(result));
    });

    function takeTicket(service, idUTK) {
        let queue_number = 0;
        let prefix = null;

        const desire_service = service;
        const todayDate = new Date().toISOString().slice(0, 10);

        // Get service prefix
        const query_service = `SELECT prefix FROM service s WHERE nom LIKE "${desire_service}"`;
        db.query(query_service, (err, result) => {
            // if (err) throw err;
            if (result.length > 0) {
                prefix = result[0].prefix;
            }
        });

        const query = `SELECT numero, service, prefix 
                    FROM ticket, service s 
                    WHERE ticket.service = s.nom AND ticket.service LIKE "${desire_service}" AND ticket.created_at BETWEEN '${todayDate}' AND NOW() 
                    ORDER BY ticket.id DESC LIMIT 1`;
        db.query(query, (err, result) => {
            // if (err) throw err;

            const code = (Math.floor(Math.random() * 1000) + 1);
            if (result.length === 0) {
                queue_number = 0;
            } else {
                queue_number = result[0].numero;
                queue_number++;
            }

            const query = `INSERT INTO ticket SET numero='${queue_number}', service="${desire_service}", code='${code}'`;
            db.query(query, (err, result) => {
                if (err) throw err;
                let full_queue_number = queue_number;
                if (prefix != null) {
                    full_queue_number = prefix + queue_number;
                }
                const idTK = result.insertId;

                const query = `SELECT COUNT(DISTINCT ticket.id) AS restant
                   FROM service, ticket WHERE service.nom = "${desire_service}" AND ticket.service = service.nom AND ticket.etat = 0 AND ticket.created_at BETWEEN '${todayDate}' AND NOW()`;

                db.query(query, (err, result) => {
                    // if (err) throw err;
                    // res.end(JSON.stringify(result));
                    const restant = result[0].restant;
                    let estimation = 5000 * restant;
                    const response = {
                        id: idTK,
                        number: full_queue_number,
                        estimation: estimation,
                        service: desire_service,
                        restant: restant,
                        code: code
                    };
                    saveUserTicket(response, idUTK);
                    // res.end(JSON.stringify(response));
                });

                // res.end("No ticket " + result.insertId);
            });

        });
    }

    function saveUserTicket(data, idUTK) {
        const code = data.code;
        const ticket = data.number;
        const idTK = data.id;

        const query = `UPDATE user_ticket SET code = ${code}, ticket = '${ticket}', idTK = ${idTK} WHERE id = ${idUTK}`;
        db.query(query, (err, result) => {
            if (err) throw err;

            addNotification("Vous passerai bientot au guichet", ticket);
            res.end(JSON.stringify(result));
        })
    }

    function addNotification(message, ticket) {
        const query = `INSERT INTO notification (type, logo, message, numero, user) VALUES ('ticket', "${photoURL}", "${message}", '${ticket}', ${user})`;
        db.query(query, (err, result) => {
           if (err) throw err;
        });
    }
});

module.exports = router;
