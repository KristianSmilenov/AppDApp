'use strict';

const storage = require('../utils/campaigns.js');
const authTokens = ['123', 'admin', 'pass', '123qwe', 'string'];

module.exports = {
    getCampaigns: getCampaigns,
    getCampaign: getCampaign,
    addCampaign: addCampaign
};

function getCampaigns(req, res) {
    storage.getCampaigns().then((campaigns) => {
        res.json(getCampaignsResponse(campaigns));
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function getCampaign(req, res) {
    var campaignId = req.swagger.params.id.value;
    storage.getCampaignById(campaignId).then((campaign) => {
        res.json(getCampaignModel(campaign));
    }).catch(err => {
        res.status(400);
        res.json({ error: true, message: err });
    });
}

function addCampaign(req, res) {
    var campaign = req.swagger.params.body.value;
    extendCampaignData(campaign);
    storage.saveCampaign(campaign)
        .then((campaign) => res.json(getCampaignModel(campaign)))
        .catch(err => {
            res.status(400);
            res.json({ error: true, message: err.message });
        });
}

function extendCampaignData(campaign) {
    campaign.campaignContractAddress = "";
    campaign.campaignContractABI = [];
    campaign.campaignDataHash = "";
    campaign.isActive = false;
}

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
        "campaignContractAddress": currentCampaign.campaignContractAddress,
        "campaignContractABI": currentCampaign.campaignContractABI,
        "campaignDataHash": currentCampaign.campaignDataHash,
        "isActive": currentCampaign.isActive
    };
}