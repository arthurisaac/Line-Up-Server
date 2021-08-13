const express = require('express');
const router = express.Router();
// const db = require('../database/database');

router.get('/', function (req, res) {
    /*const banques = [
        {
            'nom': 'BOA',
            'photoURL': 'boa_long.png',
            'agence': []
        },
        {
            'nom': 'BDU',
            'photoURL': 'bdu.png',
            'agence': [
                {
                    'nom': 'BDU siège',
                    'url': null,
                    'distance': 0,
                    "coord": {
                        "lng": -1.5206627,
                        "lat": 12.3576892
                    }
                },
                {
                    'nom': 'Agence Nkuame N\'kruma',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.518119,
                        "lat": 12.364098
                    }
                }
            ]
        },
        {
            'nom': 'ECOBANK',
            'photoURL': 'ecobank.png',
            'agence': [
                {
                    'nom': 'Agence siège',
                    'url': null,
                    'distance': 0,
                    "coord": {
                        "lng": -1.5206627,
                        "lat": 12.3576892
                    }
                },
                {
                    'nom': 'Agence 1200 logements',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.5069991,
                        "lat": 12.3688177
                    }
                },
                {
                    'nom': 'Agence Ouaga 2000',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.518119,
                        "lat": 12.364098
                    }
                },
                {
                    'nom': 'Agence Patte d\'Oie',
                    'url': null,
                    'distance': 0,
                    "coord": {
                        "lng": -1.518119,
                        "lat": 12.364018
                    }
                }
            ]
        },
        {
            'nom': 'CORIS BANK',
            'photoURL': 'cbi.svg',
            'agence': []
        }
    ];
    */
    const banques = [
        {
            'nom': 'CORIS BANK',
            'photoURL': 'cbi.svg',
            'agence': [
                {
                    'nom': 'Agence 1200 logements',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.494743464140587,
                        "lat": 12.37207848374783
                    }
                },
                {
                    'nom': 'Agence Koulouba',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.5186043942323852,
                        "lat": 12.369898701622269,
                    }
                },
                {
                    'nom': 'Agence ZAD',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.5081330508108046,
                        "lat": 12.339882930496627
                    }
                }
            ]
        },
        /*{
            'nom': 'BANQUE AGRICOLE DU FASO',
            'photoURL': 'badf.jpg',
            'agence': [
                
                {
                    'nom': 'Siège',
                    'url': 'https://obscure-refuge-04005.herokuapp.com/',
                    'distance': 0,
                    "coord": {
                        "lng": -1.5235698,
                        "lat": 12.3708036
                    }
                }
            ]
        },*/
    ];
    res.end(JSON.stringify(banques));
});
module.exports = router;
