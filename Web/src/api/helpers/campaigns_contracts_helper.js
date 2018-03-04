'use strict';

const fs = require('fs');
const Web3 = require('web3');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

module.exports = {
    createContract: createContract,
    getCampaignHash: getCampaignHash
};

function getAbi(contractName) {
    return new Promise((resolve, reject) => {
        fs.readFile('./Contracts/build/contracts/' + contractName + '.json', 'utf8', function(error, result) {
            resolve({ error: error, result: result});
        });
    });
    
}

async function createContract(contractName, address) { 

    var res = await getAbi(contractName);
    var abi = JSON.parse(res.result).abi;

    return new web3.eth.Contract(abi, address, {
        //TODO: un-hard-coded these
        from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
        gasPrice: '1',
        gas: 100000
    });  
}

function getCampaignHash(contract, campaignId) {
    return new Promise((resolve, reject) => {
        contract.methods.getCampaignHash(campaignId)
        .call({from: '0x1234567890123456789012345678901234567891'},//TODO: un-hard-code this
            function(error, result){
                resolve({ error: error, hash: result});
        });    
    });    
}


//how to use
/*
(async function() {
    var h = require('./api/helpers/campaigns_contracts_helper.js');
    var contract = await h.createContract('Campaigns', '0x30753e4a8aad7f8597332e813735def5dd395028');
    var res = await h.getCampaignHash(contract, 2);
  })();
  return;
  
  */