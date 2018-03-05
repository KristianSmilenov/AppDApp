const MongoClient = require('mongodb').MongoClient;

const storage = {
    db: null,
    config: {
        url: "mongodb://localhost:27017/Olympus"
    },
    init: () => new Promise((resolve, reject) => {
        MongoClient.connect(storage.config.url, function(err, db) {
            if (err) {
                console.log('error', `Could not connect to db.`, err);
                return reject(err);
            }
            storage.db = db.db('Olympus');
            console.log('info', `Successfully connected to db!.`);
            return resolve();
        });
    }),
    ensureIndexes: () => new Promise((resolve, reject) => {
        storage.db.collection('campaigns').ensureIndex({id: 1}, {unique: true},err => {
            if (err) {
                console.log('error', `Error ensuring an Index.`, err);
                return reject(err);
            }
            resolve();
        });
    }),
    saveCampaign: campaign => new Promise((resolve, reject) => {
        storage
        .init().then(() => {
            storage.ensureIndexes().then(() => {
                storage.db
                .collection('campaigns')
                .insertOne(campaign, function(err, res) {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });        
    }).catch(err => {
        if (err.code !== 11000) { // duplicate unique id
            console.log('error', `Error saving a campaign to db.`, err);
            reject(err);
        }
    }),
    getCampaigns: (limit) => new Promise((resolve, reject) => {
        limit = limit || 10;
        storage.init().then(() => {
            storage.db.collection('campaigns')
            .find({})
            .limit(limit)
            .toArray((err, result) => {
                if (err) {
                   return reject(err);
                }
                return resolve(result);
            });
        });
    }),
};

module.exports = storage;