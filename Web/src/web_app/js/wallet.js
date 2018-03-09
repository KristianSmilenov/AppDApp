(function () {

  initWeb3();

  var app = new Vue({
    el: '#wallet-app',
    created: function () {
      this.fetchContractsFromDB();
    },

    data: {
      crowdfundingContract_beneficiaryAddress: '',
      crowdfundingContract_endDate: '1522576800',
      crowdfundingContract_conversionRate: 1000,
      crowdfundingContract_description: 'Pre-sale #1',
      crowdfundingContract_minCap: 1000,
      userAddress: '',
      sendToAddress: '',
      sendValueAmount: '',
      savedCampaigns: [],
      contracts: {
        fundsharesToken: { bytecode: "", address: "", abi: [], instance: null },
        tokenFundraiserInfo: { bytecode: "", abi: [], address: "", instance: null, campaignId: "", campaignHash: "", details: "" }
      },
      campaignContributionTx: "",
      purchaseFundsharesReceipt: "",
      purchasedFundsharesBalance: "",
      purchasedFundsharesAddress: ""
    },
    methods: {
      fetchContractsFromDB: function () {
        var self = this;
        getContractsFromDB()
        .then((campaigns) => {
            self.savedCampaigns = campaigns;
        })
        .catch(err => console.log(err));
      },

      getMetaMaskAccount: async function() {
        this.userAddress = await getMetaMaskAccount();
      },

      invalidateCampaign: async function(campaignAddress) {
        var self = this;
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);
        fundraiserContract.methods.invalidate().call(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
                alert(error, result); //TODO: fix
            });
      },

      getCampaignState: async function(campaignAddress) {
        var self = this;
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);
        fundraiserContract.methods.invalidate().call(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
                alert(error, result); //TODO: fix
            });
      },

      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployFundsharesToken: deployFundsharesToken,

      getCampaignContractData: getCampaignContractData,
      getCampaignParticipantsData: getCampaignParticipantsData,        
      finalizeCampaign: finalizeCampaign,
      contributeToCampaign: function() {
        //TODO: remove the whole method
        contributeToCampaign
        // transfer funds to the crowdfunding address
        var self = this;
        var fundraiser = self.contracts.tokenFundraiserInfo.instance;
        fundraiser.methods.buyTokens().send({ from: self.userAddress, value: ethToWei / 1.0e15, gas: gas, gasPrice: gasPrice })
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

      viewPurchasedFundshares: viewPurchasedFundshares,
      purchaseFundshares: purchaseFundshares,
      sendEthToFundshares: sendEthToFundshares,

      saveContractToDB: saveContractToDB
    }
  });
})();