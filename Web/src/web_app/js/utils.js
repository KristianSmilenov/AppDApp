const apiConfig = {
    base: "http://localhost:10010",
    campaigns: "/campaigns",
    contracts: "/contracts"
};

const ethToWei = 1.0e18;
const gasPrice = 5000000000;
const gas = 4312388;

function forceMetamask() {
    var hasMetamask = (typeof web3 !== 'undefined' && window.web3.givenProvider && window.web3.givenProvider.isMetaMask);
    if(hasMetamask) return;

    var html = '<div class="alert alert-danger" role="alert"><strong>No Metamask detected!</strong> This page requires Metamask to function properly. Please install it and refresh.</div>';
    $('body').html(html);
}

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

function getMetaMaskAccount() {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts(function (error, accounts) {
            if (!error && accounts.length > 0) {
                resolve(accounts[0]);
            } else {
                resolve();
            }
        });
    });
}

function deployCrowdfundingContract() {
    var self = this;
    this.$http.get(apiConfig.base + apiConfig.contracts + '/CampaignTokenFundraiser')
        .then(resp => {
            var response = resp.body;
            var params = [self.crowdfundingContract_beneficiaryAddress, self.crowdfundingContract_endDate,
            self.crowdfundingContract_conversionRate, self.crowdfundingContract_description, self.crowdfundingContract_minCap];
            self.deployContract(response.bytecode, response.abi, params)
                .then((result) => {
                    self.saveContractToDB(result.contract._address, params);
                }).catch(result => {
                    alert(result.message);
                });
        }, err => {
            alert("Error getting CampaignTokenFundraiser contract info.", err);
        });
}

function saveContractToDB(address, params) {
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

async function getCampaignBalance(campaignAddress) {
    return new Promise(async (resolve, reject) => {
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);
        fundraiserContract.methods.getCampaignBalance().call(
            { from: await getMetaMaskAccount(), gas: gas, gasPrice: gasPrice }, function (error, result) {
                if(error) reject(error);
                else resolve(result);
            });
    });
}

function stateEnumToString(enumVal) {
    return ["Collecting Funds", "Waiting for Tokens", "Refunding", "Completed", "Canceled"][enumVal];
}

async function getCampaignState(campaignAddress) {
    return new Promise(async (resolve, reject) => {
    var userAddress = await getMetaMaskAccount();
    var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);
        fundraiserContract.methods.getState().call( { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if(error) reject(error);
            else resolve(stateEnumToString(result));
        });
    });
}

async function getCampaignParticipantsCount(campaignAddress) {
    return new Promise(async (resolve, reject) => {
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods
        .getParticipantsNumber()
        .call( { from: await getMetaMaskAccount(), gas: gas, gasPrice: gasPrice }, function (error, result) {
            if(error) reject(error);
            else resolve(result);
        });
    });
}

async function deployContract(bytecode, abi, params) {
    return new Promise(async (resolve, reject) => {
        var contract = new web3.eth.Contract(abi);
        contract.deploy({
            data: bytecode,
            arguments: params
        }).send({ from: await getMetaMaskAccount(), gas: gas, gasPrice: gasPrice }, function (error, transactionHash) {
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

function contributeToCampaign(campaignContractAddress, userAddress, amountETH) {
    return new Promise(async (resolve, reject) => {
        if(campaignContractAddress == '') reject('Campaign address cannot be empty!');
        if(userAddress == '') reject('User address cannot be empty!');
        if(amountETH <= 0) reject('Amount should be non-negative!');

        var contract = await getContractByAddress('CampaignTokenFundraiser', campaignContractAddress);
        contract.methods.buyTokens()
        .send({ from: userAddress, value: parseInt(amountETH * ethToWei), gas: gas, gasPrice: gasPrice })
        .on('confirmation', function (confirmationNumber, receipt) {
            resolve(receipt);
        })
        .on('error', reject);
    });
}

function getContractByAddress(name, address) {
    return new Promise((resolve, reject) => {
        $.get(apiConfig.base + apiConfig.contracts + '/' + name)
            .then(response => {
                var contract = new web3.eth.Contract(response.abi, address);
                resolve(contract);
            })
            .catch(reject);
    });
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

async function purchaseFundshares() {
    var self = this;
    var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
    fundsharesTokenContract.methods.buyTokens().send({ from: await getMetaMaskAccount(), value: 1 * ethToWei, gas: gas, gasPrice: gasPrice })
        .on('confirmation', function (confirmationNumber, receipt) {
            self.purchaseFundsharesReceipt = receipt;
        })
        .on('error', console.error);

}

async function sendEthToFundshares() {
    var self = this;
    var weiValue = parseFloat(this.sendValueAmount) * ethToWei;
    web3.eth.sendTransaction({
        from: await getMetaMaskAccount(), to: self.sendToAddress, value: weiValue,
        gasPrice: gasPrice, gas: gas
    }, function (err, txhash) {
        if (err && err.message) {
            alert('error: ' + err.message);
        } else {
            alert('Successfully sent transcation. Txhash: ' + txhash);
        }
    })
}

async function viewPurchasedFundshares() {
    var self = this;
    var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
    fundsharesTokenContract.methods.balanceOf(self.purchasedFundsharesAddress).call(
        { from: await getMetaMaskAccount(), gas: gas, gasPrice: gasPrice }, function (error, result) {
            self.purchasedFundsharesBalance = result;
        });
}

async function includeHTML() {
    return new Promise((resolve, reject) => {
        var z, i, elmnt, file, xhttp;
        /*loop through a collection of all HTML elements:*/
        z = document.getElementsByTagName("*");
        for (i = 0; i < z.length; i++) {
          elmnt = z[i];
          /*search for elements with a certain atrribute:*/
          file = elmnt.getAttribute("w3-include-html");
          if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = async function() {
              if (this.readyState == 4) {
                if (this.status == 200) {elmnt.innerHTML = this.responseText;}
                if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
                /*remove the attribute, and call this function once more:*/
                elmnt.removeAttribute("w3-include-html");
                // await includeHTML();
                resolve();
              }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
          }
        }
    });
  }