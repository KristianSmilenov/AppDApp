(function () {
  var global_keystore;
  function startApp() {
    var app = new Vue({
      el: '#app',
      data: {
        crowdfundingContract_beneficiaryAddress: '',
        crowdfundingContract_endDate: '1522576800',
        crowdfundingContract_conversionRate: 1000,
        crowdfundingContract_description: '',
        crowdfundingContract_minCap: 2 * Math.pow(10, 18),
        userEntropy: '',
        numberOfAddresses: 2,
        userAddress: '',
        userAddressDetails: '',
        secondUserAddress: '',
        secondUserAddressDetails: '',
        walletSeedWords: '',
        sendToAddress: '',
        sendValueAmount: '',
        contractAddr: '',
        contractAbi: '',
        functionName: '',
        functionArgs: '',
        contractValueAmount: '',
        config: {
          gasPrice: 5000000000, //(5 Shannon)
          gas: 4712388,
          salt: "m/0'/0'/0'",
          ethToWei: 1.0e18,
          ethHost: "http://localhost:8545"
        },
        api: {
          base: "http://localhost:10010",
          campaigns: "/campaigns",
          contracts: "/contracts"
        },
        campaignDetails: {},
        contracts: {
          fundsharesToken: { bytecode: "", address: "", abi: [], instance: null },
          campaignInfo: { address: "", abi: [] },
          campaignTokenFundraiserInfo: { bytecode: "", abi: [], address: "", instance: null, campaignId: "", campaignHash: "", details: "" }
        },
        campaignContributionTx: "",
        campaignBlockchainReceipt: "",
        campaignBlockchainHash: "",
        purchaseFundsharesReceipt: "",
        purchasedFundsharesBalance: "",
        purchasedFundsharesAddress: ""
      },
      methods: {
        getMetaMaskAccount: function () {
          var self = this;
          web3.eth.getAccounts(function (error, accounts) {
            if (!error && accounts.length > 0) {
              self.userAddress = accounts[0];
            }
          });
        },
        newWallet: function () {
          let extraEntropy = this.userEntropy;
          this.userEntropy = '';
          var randomSeed = lightwallet.keystore.generateRandomSeed(this.extraEntropy);
          var infoString = 'Your new wallet seed is: "' + randomSeed +
            '". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. ' +
            'Please enter a password to encrypt your seed while in the browser.'
          var password = prompt(infoString, 'Password');
          var self = this;
          lightwallet.keystore.createVault({
            password: password,
            seedPhrase: randomSeed,
            hdPathString: self.config.salt
          }, function (err, keystore) {
            global_keystore = keystore
            self.newAddresses(password);
            var ethHost = self.config.ethHost;
            //self.setWeb3Provider(global_keystore, ethHost);
            self.getBalances();
          })
        },
        newAddresses: function (password) {
          if (password == '') {
            password = prompt('Enter password to retrieve addresses', 'Password');
          }
          var self = this;
          global_keystore.keyFromPassword(password, function (err, pwDerivedKey) {
            global_keystore.generateNewAddress(pwDerivedKey, self.numberOfAddresses);
            var addresses = global_keystore.getAddresses();
            self.userAddress = addresses[0];
            self.secondUserAddress = addresses[1];
            self.getBalances();
          });
        },
        getBalances: function () {
          var addresses = global_keystore.getAddresses();
          var self = this;
          async.map(addresses, web3.eth.getBalance, function (err, balances) {
            async.map(addresses, web3.eth.getTransactionCount, function (err, nonces) {
              self.userAddressDetails = ' (Bal: ' + (balances[0] / 1.0e18) + ' ETH, Nonce: ' + nonces[0] + ')';
              self.secondUserAddressDetails = ' (Bal: ' + (balances[1] / 1.0e18) + ' ETH, Nonce: ' + nonces[1] + ')';
            })
          })
        },

        invokeContractFunction: function (abi, address, param) {
          var self = this;
          var weiValue = parseFloat(this.contractValueAmount) * self.config.ethToWei;
          var contract = web3.eth.Contract(abi).at(address);
          var args = JSON.parse('[' + this.param + ']');
          args.push({
            from: this.userAddress, value: weiValue,
            gasPrice: self.config.gasPrice, gas: self.config.gas
          });

          var callback = function (err, result) {
            if (err && err.message) {
              alert('error: ' + err.message);
            } else {
              alert('Invocation result: ' + result);
            }
          }
          args.push(callback);
          contract[this.functionName].apply(this, args);
        },
        deployCrowdfundingContract: function () {
          var self = this;
          this.$http.get(this.api.base + this.api.contracts + '/CampaignTokenFundraiser')
            .then(resp => {
              var response = resp.body;
              self.contracts.campaignTokenFundraiserInfo.bytecode = response.bytecode;
              self.contracts.campaignTokenFundraiserInfo.abi = response.abi;
              var params = [self.crowdfundingContract_beneficiaryAddress, self.crowdfundingContract_endDate, 
                self.crowdfundingContract_conversionRate, self.crowdfundingContract_description, self.crowdfundingContract_minCap];
              self.deployContract(response.bytecode, response.abi, params)
                .then((result) => {
                  self.contracts.campaignTokenFundraiserInfo.address = result.contract._address;
                  self.contracts.campaignTokenFundraiserInfo.abi = result.abi;
                  self.contracts.campaignTokenFundraiserInfo.instance = result.contract;
                  self.saveContractToDB(result.contract._address, params);
                }).catch(result => {
                  alert(result.message);
                });
            }, err => {
              alert("Error getting CampaignTokenFundraiser contract info.", err);
            });
        },
        
        saveContractToDB: function (address, params) {
          var body = {
            fundraiserContractAddress: address,
            beneficiaryAddress: params[0],
            endDate: parseInt(params[1]),
            conversionRate: parseInt(params[2]),
            description: params[3],
            minCap: parseInt(params[4])
          };

          this.$http.post(this.api.base + this.api.campaigns, body)
            .then(resp => {
              //TODO: do stuff
            }, err => {
              alert("Error saving Campaign info.", err);
            });
        },

        readCrowdfundingContractData: function () {
          var self = this;
          var fundraiserContract = self.contracts.campaignTokenFundraiserInfo.instance;
          fundraiserContract.methods.getCampaignBalance().call(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              self.contracts.campaignTokenFundraiserInfo.details = result + " balance";
            });
        },

        readCrowdfundingParticipantsData: function () {
          var self = this;
          var fundraiserContract = self.contracts.campaignTokenFundraiserInfo.instance;
          fundraiserContract.methods.getParticipantsNumber().call(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              self.contracts.campaignTokenFundraiserInfo.details = result + " participants";
            });
        },

        finalizeCrowdfundingContract: function () {
          var self = this;
          var fundraiserContract = self.contracts.campaignTokenFundraiserInfo.instance;
          fundraiserContract.methods.close().send(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              self.contracts.campaignTokenFundraiserInfo.details = result;
            });
        },

        deployContract: function (bytecode, abi, params) {
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
        },
        
        contributeToCampaign: function () {
          // transfer funds to the crowdfunding address
          var self = this;
          var fundraiser = self.contracts.campaignTokenFundraiserInfo.instance;
          fundraiser.methods.buyTokens().send({ from: self.userAddress, value: 1 * self.config.ethToWei, gas: self.config.gas, gasPrice: self.config.gasPrice })
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
        },
        deployFundsharesToken: function () {
          var self = this;
          this.$http.get(this.api.base + this.api.contracts + '/FundSharesToken')
            .then(resp => {
              var response = resp.body;
              self.contracts.fundsharesToken.bytecode = response.bytecode;
              self.contracts.fundsharesToken.abi = response.abi;
              
              var params = ["Token1", "TKN1", 10000000, 100];
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
        },
        purchaseFundshares: function () {
          var self = this;
          var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
          fundsharesTokenContract.methods.buyTokens().send({ from: self.userAddress, value: 1 * self.config.ethToWei, gas: self.config.gas, gasPrice: self.config.gasPrice })
            .on('confirmation', function (confirmationNumber, receipt) {
              self.purchaseFundsharesReceipt = receipt;
            })
            .on('error', console.error);

        },
        sendEthToFundshares: function () {
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
        },
        viewPurchasedFundshares: function () {
          var self = this;
          var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
          fundsharesTokenContract.methods.balanceOf(self.purchasedFundsharesAddress).call(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              self.purchasedFundsharesBalance = result;
            });
        }
      }
    });
  }

  if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.')
    window.web3 = new Web3(window.web3.givenProvider);
  } else {
    //TODO: implement normal wallet
    console.log('No web3? You should consider trying MetaMask!');
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  var account = web3.eth.accounts[0];
  var accountInterval = setInterval(function () {
    if (web3.eth.accounts[0] !== account) {
      account = web3.eth.accounts[0];
      updateInterface();
    }
  }, 100);

  startApp();

})();