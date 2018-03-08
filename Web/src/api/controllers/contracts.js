'use strict';

const utils = require('../utils/contracts.js');

module.exports = {
    getContractDetails: getContractDetails,
    deployFundsharesToken: deployFundsharesToken,
    deployCampaignTokenFundraiser: deployCampaignTokenFundraiser
};

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
    var data = req.swagger.params.body.value;
    var params = Object.values(data);
    utils.deployFundsharesToken(params).then((result) =>{ 
        res.json({address: result.contract._address, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}

function deployCampaignTokenFundraiser(req, res) {
    var data = req.swagger.params.body.value;
    var params = Object.values(data);
    utils.createCampaignTokenFundraiser(params).then((result) => {
        res.json({address: result.contract._address, abi: result.abi});
    }).catch(result => {
        res.status(400);
        res.json({error: result.error, message: result.message});
    });
}