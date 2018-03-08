'use strict';

const crypto = require('crypto');
const storage = require('../utils/campaigns.js');
const authTokens = ['123', 'admin', 'pass', '123qwe', 'string'];
const secret = 'asjdhafjajgljskegkdgndfg';

module.exports = {
    getCampaigns: getCampaigns,
    getCampaign: getCampaign,
    createCampaign: createCampaign
};

function getCampaigns(req, res) {
    storage.getCampaigns().then((campaigns) => {
        res.json(getCampaignsResponse(campaigns));
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

// function updateCampaign(req, res) {
//     var campaignId = req.swagger.params.id.value;
//     var campaign = req.swagger.params.body.value;
//     storage.updateCampaign(campaignId, campaign).then((campaign) => {
//         res.json(getCampaignModel(campaign));
//     }).catch(err => {
//         res.status(400);
//         res.json({ error: true, message: err });
//     });
// }

function getCampaign(req, res) {
    var campaignId = req.swagger.params.id.value;
    storage.getCampaignById(campaignId).then((campaign) => {
        res.json(getCampaignModel(campaign));
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function createCampaign(req, res) {
    var campaign = req.swagger.params.body.value;
    // setCampaignDataHash(campaign);
    storage.saveCampaign(campaign)
        .then((campaign) => {
            // var campaignData = getCampaignModel(campaign);
            // // update hash with campaignId
            // setCampaignDataHash(campaignData);
            // storage.updateCampaign(campaignData.id, campaignData).then((campaign) => {
            //     res.json(getCampaignModel(campaign));
            // }).catch(err => {
            //     res.status(400);
            //     res.json({ error: true, message: err });
            // });
            res.json(campaign);
        })
        .catch(err => {
            res.status(400);
            res.json({ error: true, message: err.message });
        });
}

// function setCampaignDataHash(campaign) {
//     delete campaign.campaignDataHash;
//     const hash = crypto.createHmac('sha256', secret)
//         .update(JSON.stringify(campaign))
//         .digest('hex');
//     campaign.campaignDataHash = hash;
// }

function getCampaignsResponse(campaigns) {
    var result = [];
    for (var i = 0, len = campaigns.length; i < len; i++) {
        result.push(getCampaignModel(campaigns[i]));
    }
    return result;
}

function getCampaignModel(currentCampaign) {
    return {
        "id": currentCampaign._id.toString(),
        "name": currentCampaign.name,
        "type": currentCampaign.type,
        "description": currentCampaign.description,
        "startDate": currentCampaign.startDate,
        "endDate": currentCampaign.endDate,
        "bonus": currentCampaign.bonus,
        "tokenName": currentCampaign.tokenName,
        "conversionRate": currentCampaign.conversionRate,
        "tokensHardCap": currentCampaign.tokensHardCap,
        "beneficiaryAddress": currentCampaign.beneficiaryAddress,
        "fundraiserContractAddress": currentCampaign.fundraiserContractAddress,
        "campaignDataHash": currentCampaign.campaignDataHash
    };
}