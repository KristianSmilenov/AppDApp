const conf = require('./config');
const fs = require('fs');
const Web3 = require('web3');
const winston = require('winston')
var Accounts = require('web3-eth-accounts');

var web3 = new Web3(new Web3.providers.HttpProvider(conf.ethNode));

//TODO: fix account - web3.eth.defaultAccount is async
var account = conf.defaultAccount || web3.eth.coinbase;

module.exports = {
    createContract: createContract,
    getCampaignHash: getCampaignHash,
    createCampaignToken: createCampaignToken,
    createCampaignTokenFundraiser: createCampaignTokenFundraiser
};

function getAbi(contractName) {
    return new Promise((resolve, reject) => {
        fs.readFile('./Contracts/build/contracts/' + contractName + '.json', 'utf8', function (error, result) {
            resolve({ error: error, result: result });
        });
    });

}

async function getBalance() {
    await web3.eth.getBalance(account);
}

async function createCampaignTokenFundraiser(address) {
    return deployContract("CampaignTokenFundraiser", [address]);
}

async function createCampaignToken(tokensCount) {
    return deployContract("CampaignToken", [tokensCount]);
}

async function deployContract(contractName, arguments) {

    winston.log('info', 'Deploying ' + contractName + ' contract');
    return new Promise((resolve, reject) => {
        getAbi(contractName).then((data) => {

            var abi = JSON.parse(data.result).abi;
            var bytecode = JSON.parse(data.result).bytecode;
            var contract = new web3.eth.Contract(abi);
            contract.deploy({
                data: bytecode,
                arguments: arguments
            })
                .send({ from: account, gas: conf.gas, gasPrice: conf.gasPrice }, function (error, transactionHash) {
                    if (error) { reject({ error: true, message: error.message }); }
                })
                .on('error', function (error) { reject({ error: true, message: error.message }); })
                .on('transactionHash', function (transactionHash) { winston.log('info', 'TransactionHash: ' + transactionHash); })
                .on('confirmation', function (confirmationNumber, receipt) { })
                .then(function (newContractInstance) {
                    winston.log('info', newContractInstance.options.address);
                    resolve({ contract: newContractInstance, abi: abi });
                });
        }, function (error) {
            reject({ error: true, message: error.message });
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