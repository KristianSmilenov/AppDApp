'use strict';

const utils = require('../utils/contracts.js');

module.exports = {
    getContractDetails: getContractDetails
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