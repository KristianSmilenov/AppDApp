'use strict';

const conf = require('./config');
const fs = require('fs');
const Web3 = require('web3');
const winston = require('winston')

var web3 = new Web3(new Web3.providers.HttpProvider(conf.ethNode));

//TODO: fix account - web3.eth.defaultAccount is async
var account = conf.defaultAccount || web3.eth.defaultAccount;

module.exports = {
    createContract: createContract,
    getCampaignHash: getCampaignHash,
    createCampaignToken: createCampaignToken
};

function getAbi(contractName) {
    return new Promise((resolve, reject) => {
        fs.readFile('./Contracts/build/contracts/' + contractName + '.json', 'utf8', function (error, result) {
            resolve({ error: error, result: result });
        });
    });

}

async function createCampaignToken(tokensCount) {
    winston.log('info', 'Creating campaign token');
    return new Promise((resolve, reject) => {
        getAbi("CampaignToken").then((data) => {
            var abi = JSON.parse(data.result).abi;
            winston.log('info', 'CampaignToken ABI retrieved');
            var contractInstance = new web3.eth.Contract(abi, account, { from: account, gas: conf.gas, gasPrice: conf.gasPrice },
                function (error, contract) {
                    if (!error) {
                        winston.log('info', 'CampaignToken data retrieved: ' + JSON.stringify(contract));
                        if (contract.address) {
                            winston.log('info', 'Successfully deployed contract: ' + contract.address);
                            resolve({ contract: contract });
                        }
                    } else {
                        winston.log('error', 'Error creating contract: ' + JSON.stringify(error));
                        reject({ error: error });
                    }
                });
            winston.log('info', JSON.stringify(contractInstance.methods));
        }, function (error) {
            reject({ error: error });
        })
    });
}

function createContract(contractName, address) {
    return new Promise((resolve, reject) => {
        getAbi(contractName).then((data) => {
            var abi = JSON.parse(data.result).abi;

            resolve({
                contract: new web3.eth.Contract(abi, address, {
                    from: account,
                    gasPrice: '1',
                    gas: 100000
                })
            });
        });
    });
}

function getCampaignHash(contract, campaignId) {
    return new Promise((resolve, reject) => {
        contract.methods.getCampaignHash(campaignId)
            .call({ from: account },
                function (error, result) {
                    resolve({ error: error, hash: result });
                });
    });
}