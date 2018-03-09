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

      invalidateCampaign: async function(campaignAddress) {
        var self = this;
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);
        fundraiserContract.methods.invalidate().call(
            { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
                alert(error, result); //TODO: fix
            });
      },

      refreshGrid: function() {
        var b = this.savedCampaigns;
        this.savedCampaigns = [];
        this.savedCampaigns = b;
      },

      getCampaignState: async function(campaignAddress) {
        var state = await getCampaignState(campaignAddress);
        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .state = state;

          this.refreshGrid();
      },

      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployFundsharesToken: deployFundsharesToken,

      getCampaignBalance: async function(campaignAddress) {
        var bal = await getCampaignBalance(campaignAddress);

        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .balance = bal;

          this.refreshGrid();
      },

      getCampaignParticipantsData: getCampaignParticipantsData,        
      finalizeCampaign: finalizeCampaign,
      contributeToCampaign: async function(address) {
        await contributeToCampaign(address, await getMetaMaskAccount(), 0.01);
      },

      viewPurchasedFundshares: viewPurchasedFundshares,
      purchaseFundshares: purchaseFundshares,
      sendEthToFundshares: sendEthToFundshares,

      saveContractToDB: saveContractToDB
    }
  });
})();