const apiConfig = {
    base: "http://localhost:10010",
    campaigns: "/campaigns",
    contracts: "/contracts"
};

function initWeb3() {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.')
    window.web3 = new Web3(window.web3.givenProvider);
  } else {
    //TODO: implement normal wallet
    console.log('No web3? You should consider trying MetaMask!');
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }
}

function initAccount() {
  var account = web3.eth.accounts[0];
  var accountInterval = setInterval(function () {
    if (web3.eth.accounts[0] !== account) {
      account = web3.eth.accounts[0];
      updateInterface();
    }
  }, 100);
}

function getMetaMaskAccount() {
    var self = this;
    web3.eth.getAccounts(function (error, accounts) {
        if (!error && accounts.length > 0) {
            self.userAddress = accounts[0];
        }
    });
}
function deployCrowdfundingContract() {
    var self = this;
    this.$http.get(apiConfig.base + apiConfig.contracts + '/CampaignTokenFundraiser')
        .then(resp => {
            var response = resp.body;
            self.contracts.tokenFundraiserInfo.bytecode = response.bytecode;
            self.contracts.tokenFundraiserInfo.abi = response.abi;
            var params = [self.crowdfundingContract_beneficiaryAddress, self.crowdfundingContract_endDate,
            self.crowdfundingContract_conversionRate, self.crowdfundingContract_description, self.crowdfundingContract_minCap];
            self.deployContract(response.bytecode, response.abi, params)
                .then((result) => {
                    self.contracts.tokenFundraiserInfo.address = result.contract._address;
                    self.contracts.tokenFundraiserInfo.abi = result.abi;
                    self.contracts.tokenFundraiserInfo.instance = result.contract;
                    self.saveContractToDB(result.contract._address, params);
                }).catch(result => {
                    alert(result.message);
                });
        }, err => {
            alert("Error getting CampaignTokenFundraiser contract info.", err);
        });
}

function saveContractToDB(address, params) {
    var self = this;
    var body = {
        fundraiserContractAddress: address,
        beneficiaryAddress: params[0],
        endDate: parseInt(params[1]),
        conversionRate: parseInt(params[2]),
        description: params[3],
        minCap: parseInt(params[4])
    };

    this.$http.post(apiConfig.base + apiConfig.campaigns, body)
        .then(resp => {
            //TODO: do stuff
        }, err => {
            alert("Error saving Campaign info.", err);
        });
}


function getContractsFromDB() {
    return $.get(apiConfig.base + apiConfig.campaigns);
}


function getCampaignContractData() {
    var self = this;
    var fundraiserContract = self.contracts.tokenFundraiserInfo.instance;
    fundraiserContract.methods.getCampaignBalance().call(
        { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
            self.contracts.tokenFundraiserInfo.details = result + " balance";
        });
}

function getCampaignParticipantsData() {
    var self = this;
    var fundraiserContract = self.contracts.tokenFundraiserInfo.instance;
    fundraiserContract.methods.getParticipantsNumber().call(
        { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
            self.contracts.tokenFundraiserInfo.details = result + " participants";
        });
}

function finalizeCampaign() {
    var self = this;
    var fundraiserContract = self.contracts.tokenFundraiserInfo.instance;
    fundraiserContract.methods.close().send(
        { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
            self.contracts.tokenFundraiserInfo.details = result;
        });
}

function deployContract(bytecode, abi, params) {
    var self = this;
    return new Promise((resolve, reject) => {
        var contract = new web3.eth.Contract(abi);
        contract.deploy({
            data: bytecode,
            arguments: params
        }).send({ from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, transactionHash) {
            if (error) {
                reject({ error: true, message: error.message });
            }
        })
            .on('error', error => reject({ error: true, message: error.message }))
            .then(function (newContractInstance) {
                console.log('info', newContractInstance.options.address);
                resolve({ contract: newContractInstance, abi: abi });
            });
    }, function (error) {
        reject({ error: true, message: error.message });
    });
}

function contributeToCampaign() {
    // transfer funds to the crowdfunding address
    var self = this;
    var fundraiser = self.contracts.tokenFundraiserInfo.instance;
    fundraiser.methods.buyTokens().send({ from: self.userAddress, value: self.config.ethToWei / 1.0e15, gas: self.config.gas, gasPrice: self.config.gasPrice })
        .on('transactionHash', function (hash) {
            self.campaignContributionTx = hash;
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            self.campaignContributionTx = receipt;
        })
        .on('receipt', function (receipt) {
            console.log(receipt);
        })
        .on('error', console.error);
}

function deployFundsharesToken() {
    var self = this;
    this.$http.get(apiConfig.base + apiConfig.contracts + '/FundSharesToken')
        .then(resp => {
            var response = resp.body;
            self.contracts.fundsharesToken.bytecode = response.bytecode;
            self.contracts.fundsharesToken.abi = response.abi;

            var params = ["Token1", "TKN1", 1000, 1000];
            self.deployContract(response.bytecode, response.abi, params)
                .then((result) => {
                    self.contracts.fundsharesToken.address = result.contract._address;
                    self.contracts.fundsharesToken.abi = result.abi;
                    self.contracts.fundsharesToken.instance = result.contract;
                }).catch(result => {
                    alert(result.message);
                });
        }, err => {
            alert("Error getting FundSharesToken contract info.", err);
        });
}

function purchaseFundshares() {
    var self = this;
    var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
    fundsharesTokenContract.methods.buyTokens().send({ from: self.userAddress, value: 1 * self.config.ethToWei, gas: self.config.gas, gasPrice: self.config.gasPrice })
        .on('confirmation', function (confirmationNumber, receipt) {
            self.purchaseFundsharesReceipt = receipt;
        })
        .on('error', console.error);

}

function sendEthToFundshares() {
    var self = this;
    var weiValue = parseFloat(this.sendValueAmount) * self.config.ethToWei;
    web3.eth.sendTransaction({
        from: self.userAddress, to: self.sendToAddress, value: weiValue,
        gasPrice: self.config.gasPrice, gas: self.config.gas
    }, function (err, txhash) {
        if (err && err.message) {
            alert('error: ' + err.message);
        } else {
            alert('Successfully sent transcation. Txhash: ' + txhash);
        }
    })
}

function viewPurchasedFundshares() {
    var self = this;
    var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
    fundsharesTokenContract.methods.balanceOf(self.purchasedFundsharesAddress).call(
        { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
            self.purchasedFundsharesBalance = result;
        });
}