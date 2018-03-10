'use strict';

const storage = require('../utils/mongo.js');

module.exports = {
    getTokens: getTokens,
    getToken: getToken,
    createToken: createToken
};

function getTokens(req, res) {
    storage.getTokens().then((tokens) => {
        res.json(tokens);
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function getToken(req, res) {
    var tokenId = req.swagger.params.id.value;
    storage.getTokenById(tokenId).then((token) => {
        res.json(token);
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function createToken(req, res) {
    var token = req.swagger.params.body.value;
    storage.saveToken(token)
        .then((token) => {
            res.json(token);
        })
        .catch(err => {
            res.status(400);
            res.json({ error: true, message: err.message });
        });
}