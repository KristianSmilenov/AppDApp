const conf = require('./config');
const fs = require('fs');
const winston = require('winston')

module.exports = {
    getContractDetails: getContractDetails
};

function getCompiledContractDefinition(contractName) {
    return new Promise((resolve, reject) => {
        fs.readFile('./Contracts/build/contracts/' + contractName + '.json', 'utf8', function (error, result) {
            resolve({ error: error, result: result });
        });
    });

}

function getContractDetails(contractName) {
    return new Promise((resolve, reject) => {
        getCompiledContractDefinition(contractName).then((data) => {
            var abi = JSON.parse(data.result).abi;
            var bytecode = JSON.parse(data.result).bytecode;
            resolve({abi: abi, bytecode: bytecode});
        }, function (error) {
            reject({ error: true, message: error.message });
        })
    });
}