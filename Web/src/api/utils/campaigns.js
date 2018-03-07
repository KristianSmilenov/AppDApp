const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const storage = {
    db: null,
    config: {
        url: "mongodb://localhost:27017/Olympus"
    },
    init: () => new Promise((resolve, reject) => {
        MongoClient.connect(storage.config.url, function (err, db) {
            if (err) {
                console.log('error', 'Could not connect to db.', err);
                return reject(err);
            }
            storage.db = db.db('Olympus');
            console.log('info', 'Successfully connected to db!.');
            return resolve();
        });
    }),
    saveCampaign: campaign => new Promise((resolve, reject) => {
        storage.init().then(() => {
            storage.db
                .collection('campaigns')
                .insertOne(campaign, function (err, response) {
                    if (err) {
                        console.log('error', 'Error saving a campaign to db.', err);
                        return reject(err);
                    }
                    console.log('info', 'Campaign created: ' + response.ops[0]._id);
                    resolve(response.ops[0]);
                });
        });
    }).catch(err => {
        console.log('error', 'Error saving a campaign to db.', err);
        reject(err);
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
    updateCampaign: (idString, campaign) => new Promise((resolve, reject) => {
        //TODO: update also the other fields
        storage.init().then(() => {
            storage.db.collection('campaigns')
                .findOneAndUpdate(
                    { "_id": ObjectId(idString) },
                    {
                        $set:
                            {
                                beneficiaryAddress: campaign.beneficiaryAddress,
                                fundraiserContractAddress: campaign.fundraiserContractAddress
                            }
                    }, function (err, result) {
                        if (err) { return reject(err); }
                        return resolve(result.value);
                    });
        });
    })
};

module.exports = storage;