'use strict';

const utils = require('../utils/contracts.js');

module.exports = {
    getContractDetails: getContractDetails,
    deployCampaigns: deployCampaigns,
    deployCampaignToken: deployCampaignToken,
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

function deployCampaignToken(req, res) {
    var amount = req.swagger.params.body.value.amount;
    utils.createCampaignToken(amount).then((result) =>{ 
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

/*
(async function() {
    var h = require('./api/utils/contracts.js');
    var contractAddress = '0x30753e4a8aad7f8597332e813735def5dd395028';
    var contract = await h.createContract('Campaigns', contractAddress);
    var res = await h.getCampaignHash(contract, 2);
  })();
  return;
  */
 // --- TEST --- 
// var h = require('../utils/contracts.js');
// var contractAddress = '0x30753e4a8aad7f8597332e813735def5dd395028';
// var contract = h.createContract('Campaigns', contractAddress).then(result => {
//     debugger;
//     h.getCampaignHash(result.contract, 2).then(result => {
//         if (result.error) {
//             res.status(400);
//             res.json({ error: true, message: result.error.message });
//         } else {
//             res.json(JSON.stringify(result.hash));
//         }
//     });;
// });
// --- END TEST --- 