'use strict';

const storage = require('../utils/mongo.js');

module.exports = {
    getCampaigns: getCampaigns,
    getCampaign: getCampaign,
    createCampaign: createCampaign
};

function getCampaigns(req, res) {
    storage.getCampaigns().then((campaigns) => {
        res.json(campaigns);
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function getCampaign(req, res) {
    var campaignId = req.swagger.params.id.value;
    storage.getCampaignById(campaignId).then((campaign) => {
        res.json(campaign);
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function createCampaign(req, res) {
    var campaign = req.swagger.params.body.value;
    campaign.imgSrc = 'img/campaigns/' + parseInt(Math.random() * 7 % 7) + '.jpg';
    storage.saveCampaign(campaign)
        .then((campaign) => {
            res.json(campaign);
        })
        .catch(err => {
            res.status(400);
            res.json({ error: true, message: err.message });
        });
}