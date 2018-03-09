(async function () {

  forceMetamask();
  initWeb3();
  await includeHTML();

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
      },
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

      invalidateCampaign: async function(campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.invalidate().send(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
              if(error) showError(error);
              else showSuccess(result);
            });
      },

      closeCampaign: async function(campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.close().send(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
              if(error) showError(error);
              else showSuccess(result);
            });
      },

      finalizeCampaign: async function(campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.sendTokens().send(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
              if(error) showError(error);
              else showSuccess(result);
            });
      },

      refreshGrid: function() {
        var b = this.savedCampaigns;
        this.savedCampaigns = [];
        this.savedCampaigns = b;
      },

      refreshCampaignData: async function (campaignAddress) {
        await this.getCampaignState(campaignAddress);
        await this.getCampaignBalance(campaignAddress);
        await this.getCampaignParticipantsCount(campaignAddress);
      },

      getCampaignState: async function(campaignAddress) {
        var state = await getCampaignState(campaignAddress);
        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .state = state;

          this.refreshGrid();
      },

      getCampaignBalance: async function(campaignAddress) {
        var bal = await getCampaignBalance(campaignAddress);

        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .balance = bal;

          this.refreshGrid();
      },

      contributeToCampaign: async function(campaignAddress) {
        await contributeToCampaign(campaignAddress, await getMetaMaskAccount(), 0.01);
      },

      getCampaignParticipantsCount: async function(campaignAddress) {
        var count = await getCampaignParticipantsCount(campaignAddress);
        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .participantCount = count;

          this.refreshGrid();
      },
      
      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployFundsharesToken: deployFundsharesToken,

      viewPurchasedFundshares: viewPurchasedFundshares,
      purchaseFundshares: purchaseFundshares,
      sendEthToFundshares: sendEthToFundshares,

      saveContractToDB: saveContractToDB
    }
  });
})();