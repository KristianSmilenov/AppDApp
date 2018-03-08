'use strict';

const utils = require('../utils/contracts.js');

module.exports = {
    getContractDetails: getContractDetails,
    deployCampaigns: deployCampaigns,
    deployFundsharesToken: deployFundsharesToken,
    deployCampaignTokenFundraiser: deployCampaignTokenFundraiser,
    publishCampaign: publishCampaign
};

function publishCampaign(req, res) {
    var campaignId = req.swagger.params.id.value;
    // should we publish this on server side?
    res.json();
}

function getContractDetails(req, res) {
    var contractName = req.swagger.params.contractName.value;
    utils.getContractDetails(contractName).then((result) =>{ 
        res.json({bytecode: result.bytecode, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}

function deployFundsharesToken(req, res) {
    var amount = req.swagger.params.body.value.amount;
    utils.deployFundsharesToken(amount).then((result) =>{ 
        res.json({address: result.contract._address, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}

function deployCampaigns(req, res) {
    //TODO: check if contract is already deployed, if yes do not deploy again but return address
    utils.createCampaigns().then((result) =>{ 
        res.json({address: result.contract._address, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}

function deployCampaignTokenFundraiser(req, res) {
    var address = req.swagger.params.body.value.address;
    utils.createCampaignTokenFundraiser(address).then((result) => {
        res.json({address: result.contract._address, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}