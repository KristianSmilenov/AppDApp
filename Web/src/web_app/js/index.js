(function () {
  var global_keystore;
  function startApp() {
    var app = new Vue({
      el: '#app',
      data: {
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
          fundsharesToken: { address: "", abi: [] },
          campaignInfo: { address: "", abi: [] },
          campaignTokenFundraiserInfo: { bytecode: "", abi: [], address: "", instance: null, campaignId: "", campaignHash: "" }
        },
        campaignContributionTx: "",
        campaignBlockchainReceipt: "",
        campaignBlockchainHash: "",
        purchaseFundsharesReceipt: "",
        purchasedFundsharesBalance: ""
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
        setWeb3Provider: function (keystore, ethHost) {
          //web3.setProvider(ethHost);
          //var web3 = new Web3(Web3.givenProvider || ethHost);
          // depricated
          // var web3Provider = new HookedWeb3Provider({
          //   host: ethHost,
          //   transaction_signer: keystore
          // });
          // web3.setProvider(web3Provider);
        },
        setSeed: function () {
          var self = this;
          var password = prompt('Enter Password to encrypt your seed', 'Password');
          lightwallet.keystore.createVault({
            password: password,
            seedPhrase: this.walletSeedWords,
            hdPathString: self.config.salt
          }, function (err, ks) {
            global_keystore = ks;
            self.walletSeedWords = '';
            self.newAddresses(password);
            var ethHost = self.config.ethHost;
            //self.setWeb3Provider(global_keystore, ethHost);
            self.getBalances();
          })
        },
        showSeed: function () {
          var password = prompt('Enter password to show your seed. Do not let anyone else see your seed.', 'Password');
          global_keystore.keyFromPassword(password, function (err, pwDerivedKey) {
            var seed = global_keystore.getSeed(pwDerivedKey);
            alert('Your seed is: "' + seed + '". Please write it down.');
          });
        },
        sendEth: function () {
          var self = this;
          var weiValue = parseFloat(this.sendValueAmount) * self.config.ethToWei;
          web3.eth.sendTransaction({
            from: this.userAddress, to: this.sendToAddress, value: weiValue,
            gasPrice: self.config.gasPrice, gas: self.config.gas
          }, function (err, txhash) {
            if (err && err.message) {
              alert('error: ' + err.message);
            } else {
              alert('Successfully sent transcation. Txhash: ' + txhash);
            }
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
        deployCampaignContracts: function () {
          // make sure campaign contract is deployed
          var self = this;
          this.$http.get(this.api.base + this.api.contracts + '/campaign').then(response => {
            self.contracts.campaignInfo = response.body;
          }, response => {
            alert("Error deploying Campaigns contract.");
          });
        },
        createCampaign: function () {
          var campaignData = {
            name: "Smartcontainers - " + Math.random(),
            type: "Presale",
            description: "Temperature sensitive logistics. Revolutionised",
            startDate: 1520348640,
            endDate: 1520363119,
            bonus: 30,
            tokenName: "SMARC",
            conversionRate: 9000,
            tokensHardCap: 71250,
            beneficiaryAddress: this.userAddress,
            fundraiserContractAddress: this.contracts.campaignTokenFundraiserInfo.address
          };

          var self = this;
          this.$http.post(this.api.base + this.api.campaigns, campaignData).then(response => {
            self.campaignDetails = response.body;
          }, response => {
            alert("Error creating campaign.");
          });
        },
        deployCrowdfundingContract: function () {
          // deploy crowdfunding contract with campaignId and beneficiaryAddress from campaign
          var self = this;
          this.$http.get(this.api.base + this.api.contracts + '/CampaignTokenFundraiser').then(response => {
            var response = response.body;
            self.contracts.campaignTokenFundraiserInfo.bytecode = response.bytecode;
            self.contracts.campaignTokenFundraiserInfo.abi = response.abi;
            self.deployContract(response.bytecode, response.abi, [self.userAddress]).then((result) => {
              self.contracts.campaignTokenFundraiserInfo.address = result.contract._address;
              self.contracts.campaignTokenFundraiserInfo.abi = result.abi;
              self.contracts.campaignTokenFundraiserInfo.instance = result.contract;
            }).catch(result => {
              alert(result.message);
            });
          }, response => {
            alert("Error getting token fundraiser contract info.");
          });
        },
        deployContract: function (bytecode, abi, param) {
          var self = this;
          return new Promise((resolve, reject) => {
            var contract = new web3.eth.Contract(abi);
            contract.deploy({
              data: bytecode,
              arguments: param
            })
              .send({ from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, transactionHash) {
                if (error) { reject({ error: true, message: error.message }); }
              })
              .on('error', function (error) { reject({ error: true, message: error.message }); })
              .then(function (newContractInstance) {
                console.log('info', newContractInstance.options.address);
                resolve({ contract: newContractInstance, abi: abi });
              });
          }, function (error) {
            reject({ error: true, message: error.message });
          });
        },
        setCrowdfundingContractCampaign: function () {
          // set fundraising contract, campaignId
          var self = this;
          var fundraiserContract = self.contracts.campaignTokenFundraiserInfo.instance;
          fundraiserContract.methods.setCampaignId(self.campaignDetails.id).send(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              if (!error) {
                fundraiserContract.methods.getCampaignId().call(
                  { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
                    self.contracts.campaignTokenFundraiserInfo.campaignId = result;
                  });
              }
            });
        },
        publishCampaignOnBlockchain: function () {
          // add crowdfunding address to the campaign, create the hash and publish it on blockchain
          var self = this;
          var campaignContract = new web3.eth.Contract(self.contracts.campaignInfo.abi, self.contracts.campaignInfo.address);
          self.contracts.campaignInfo.instance = campaignContract;

          // function addCampaign(string id, bool isActive, string campaignHash) public {
          campaignContract.methods.addCampaign(self.campaignDetails.id, false, self.campaignDetails.campaignDataHash)
          .send({ from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice })
          .on('confirmation', function (confirmationNumber, receipt) {
            self.campaignBlockchainReceipt = receipt;
          })
          .on('error', console.error);
          
        },
        getCampaignBlockchainInfo: function () {
          // get campaign hash from blockchain
          var self = this;
          var campaignContract = new web3.eth.Contract(self.contracts.campaignInfo.abi, self.contracts.campaignInfo.address);
          self.contracts.campaignInfo.instance = campaignContract;

          campaignContract.methods.getCampaignHash(self.campaignDetails.id).call(
            { from: self.userAddress, gas: self.config.gas, gasPrice: self.config.gasPrice }, function (error, result) {
              self.campaignBlockchainHash = result;
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
        deployFundsharesToken: function (){ 
          var self = this;
          var contract = {
            "name": "Token1",
            "symbol": "TKN1",
            "totalSupply": 10000000,
            "rate": 100
          };
          this.$http.post(this.api.base + this.api.contracts + '/fundshares-token', contract).then(response => {
            var response = response.body;
            self.contracts.fundsharesToken.address = response.address;
            self.contracts.fundsharesToken.abi = response.abi;
          }, response => {
            alert("Error getting token fundraiser contract info.");
          });
        }, 
        purchaseFundshares: function () {
          var self = this;
          var fundsharesTokenContract = new web3.eth.Contract(self.contracts.fundsharesToken.abi, self.contracts.fundsharesToken.address);
          self.contracts.fundsharesToken.instance = fundsharesTokenContract;

          fundsharesTokenContract.methods.buyTokens().send({ from: self.userAddress, value: 1 * self.config.ethToWei, gas: self.config.gas, gasPrice: self.config.gasPrice })
            .on('confirmation', function (confirmationNumber, receipt) {
              self.purchaseFundsharesReceipt = receipt;
            })
            .on('error', console.error);

        }, 
        viewPurchasedFundshares: function () {
          var self = this;
          var fundsharesTokenContract = self.contracts.fundsharesToken.instance;

          fundsharesTokenContract.methods.balanceOf(self.userAddress).call(
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