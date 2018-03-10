const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const winston = require('winston')

const storage = {
    db: null,
    config: {
        url: "mongodb://localhost:27017/Olympus"
    },
    init: () => new Promise((resolve, reject) => {
        MongoClient.connect(storage.config.url, function (err, db) {
            if (err) {
                winston.log('error', 'Could not connect to db. ' + err);
                return reject(err);
            }
            storage.db = db.db('Olympus');
            winston.log('info', 'Successfully connected to db!');
            return resolve();
        });
    }),
    saveCampaign: campaign => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db
                .collection('campaigns')
                .insertOne(campaign, function (err, response) {
                    if (err) {
                        winston.log('error', 'Error saving a campaign to db. ' + err);
                        return reject(err);
                    }
                    winston.log('info', 'Campaign created: ' + response.ops[0]._id);
                    resolve(response.ops[0]);
                });
        });
    }),
    getCampaigns: () => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db.collection('campaigns')
                .find({})
                .toArray((err, result) => {
                    if (err) { return reject(err); }
                    return resolve(result);
                });
        });
    }),
    getCampaignById: (idString) => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db.collection('campaigns')
                .findOne({ "_id": ObjectId(idString) }, function (err, result) {
                    if (err) { return reject(err); }
                    return resolve(result);
                });
        });
    }),

    saveToken: token => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db
                .collection('tokens')
                .insertOne(token, function (err, response) {
                    if (err) {
                        winston.log('error', 'Error saving token to db.' + err);
                        return reject(err);
                    }
                    winston.log('info', 'Token created: ' + response.ops[0]._id);
                    resolve(response.ops[0]);
                });
        });
    }),
    getTokens: () => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db.collection('tokens')
                .find({})
                .toArray((err, result) => {
                    if (err) {
                        winston.log('error', 'Error getting tokens from db. ' + err);
                        return reject(err);
                    }
                    return resolve(result);
                });
        });
    }),
    getTokenById: (idString) => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db.collection('tokens')
                .findOne({ "_id": ObjectId(idString) }, function (err, result) {
                    if (err) {
                        winston.log('error', 'Error getting token from db. ' + err);
                        return reject(err);
                    }
                    return resolve(result);
                });
        });
    })
};

module.exports = storage;