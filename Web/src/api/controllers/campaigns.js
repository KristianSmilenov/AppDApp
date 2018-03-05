'use strict';

const storage = require('../utils/campaigns_storage.js');
const authTokens = ['123', 'admin', 'pass', '123qwe', 'string'];

module.exports = {
    getCampaigns: getCampaigns,
    getCampaign: getCampaign,
    addCampaign: addCampaign
};
  
function getCampaigns(req, res) {
    storage.getCampaigns().then((campaigns) =>{
        res.json({data: campaigns});
    }).catch(err => {
        res.status(400);
        res.json({error: true, message: err});
    });
}

function getCampaign(req, res) {
    var campaignId = req.swagger.params.id.value;
    storage.getCampaigns(campaignId).then((campaigns) =>{
        res.json();
    }).catch(err => {
        res.status(400);
        res.json({error: true, message: err});
    });
}

function addCampaign(req, res) {
    var campaign = req.swagger.params.body.value;

    //TODO: move this to DB
    if(authTokens.indexOf(campaign.authToken) < 0) {
        res.status(400);
        res.json({error: true, message: "Please provide a valida authentication token"});
    }

    delete campaign.authToken;

    storage.saveCampaign(campaign)
    .then(() => res.json({}))
    .catch(err => {
        res.status(400);
        res.json({error: true, message: err});
    });
}
