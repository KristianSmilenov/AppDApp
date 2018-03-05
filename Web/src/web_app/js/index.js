'use strict';
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
          gasPrice: 18000000000,
          gas: 50000,
          salt: "m/0'/0'/0'",
          ethToWei: 1.0e18,
          ethHost: "http://localhost:8545"
        }
      },
      methods: {
        contributeToCampaign: function () {
          alert("TODO: Use the REST API to deploy the contract and get address and ABI");
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
            self.setWeb3Provider(global_keystore, ethHost);
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
          var web3Provider = new HookedWeb3Provider({
            host: ethHost,
            transaction_signer: keystore
          });
          web3.setProvider(web3Provider);
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
            self.setWeb3Provider(global_keystore, ethHost);
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
            if(err && err.message) {
              alert('error: ' + err.message);
            } else {
              alert('Successfully sent transcation. Txhash: ' + txhash);
            }
          })
        },
        invokeContractFunction: function () {
          var self = this;
          var weiValue = parseFloat(this.contractValueAmount) * self.config.ethToWei;
          var contract = web3.eth.contract(JSON.parse(this.contractAbi)).at(this.contractAddr);
          var args = JSON.parse('[' + this.functionArgs + ']');
          args.push({
            from: this.userAddress, value: weiValue,
            gasPrice: self.config.gasPrice, gas: self.config.gas
          });

          var callback = function (err, result) {
            if(err && err.message) {
              alert('error: ' + err.message);
            } else {
              alert('Invocation result: ' + result);
            }
          }
          args.push(callback);
          contract[this.functionName].apply(this, args);
        }
      }
    });
  }

  startApp();

})();