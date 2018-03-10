(async function () {

  forceMetamask();
  initWeb3();

  var app = new Vue({
    el: '#wallet-app',
    created: function () {
      this.fetchContractsFromDB();
    },

    data: {
      views: ["campaignsList", "createCampaign", "tokensList", "createTokens"],
      currentView: "campaignsList",

      // User when creating new crowdfunding campaign
      crowdfundingContract_beneficiaryAddress: '',
      crowdfundingContract_endDate: '1522576800',
      crowdfundingContract_conversionRate: 1000,
      crowdfundingContract_description: 'Pre-sale #1',
      crowdfundingContract_minCap: 1000,

      // Used when creating new token
      tokenContract_name: 'Crypto Investoment Fund',
      tokenContract_symbol: 'CIF',
      tokenContract_totalSupply: '1000',
      tokenContract_rate: '1000',
      tokenContract_minInvestment: '1000',

      // Show user token balance for selected contract
      selectedTokenContractSymbol: '',
      selectedTokenContractAddress: '',
      tokenContractUserAddress: '',

      userAddress: '',
      //sendToAddress: '',
      //sendValueAmount: '',
      savedCampaigns: [],
      savedTokens: []
    },
    methods: {
      changeView: function (viewName) {
        this.currentView = viewName;
        switch (viewName) {
          case "campaignsList":
            this.fetchCampaignsFromDB();
            break;
          case "tokensList":
            this.fetchTokensFromDB();
            break;
        }
      },

      setActiveTokenContract: function (token) {
        this.selectedTokenContractSymbol = token.symbol;
        this.selectedTokenContractAddress = token.address;
      },

      fetchContractsFromDB: function () {
        this.fetchCampaignsFromDB();
        this.fetchTokensFromDB();
      },

      fetchCampaignsFromDB() {
        var self = this;
        getCampaignContractsFromDB()
          .then((campaigns) => {
            self.savedCampaigns = campaigns;
          })
          .catch(err => console.log(err));
      },

      fetchTokensFromDB() {
        var self = this;
        getTokenContractsFromDB().then((tokens) => {
          self.savedTokens = tokens;
        })
          .catch(err => console.log(err));
      },

      invalidateCampaign: async function (campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.invalidate().send(
          { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if (error) showError(error);
            else showSuccess(result);
          });
      },

      closeCampaign: async function (campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.close().send(
          { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if (error) showError(error);
            else showSuccess(result);
          });
      },

      finalizeCampaign: async function (campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.sendTokens().send(
          { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if (error) showError(error);
            else showSuccess(result);
          });
      },

      refreshGrid: function () {
        var b = this.savedCampaigns;
        this.savedCampaigns = [];
        this.savedCampaigns = b;
      },

      refreshCampaignData: async function (campaignAddress) {
        await this.getCampaignState(campaignAddress);
        await this.getCampaignBalance(campaignAddress);
        await this.getCampaignParticipantsCount(campaignAddress);
      },

      getCampaignState: async function (campaignAddress) {
        var state = await getCampaignState(campaignAddress);
        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .state = state;

        this.refreshGrid();
      },

      getCampaignBalance: async function (campaignAddress) {
        var bal = await getCampaignBalance(campaignAddress);

        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .balance = bal;

        this.refreshGrid();
      },

      contributeToCampaign: async function (campaignAddress) {
        await contributeToCampaign(campaignAddress, await getMetaMaskAccount(), 0.01);
      },

      getCampaignParticipantsCount: async function (campaignAddress) {
        var count = await getCampaignParticipantsCount(campaignAddress);
        this.savedCampaigns
          .find(c => c.fundraiserContractAddress == campaignAddress)
          .participantCount = count;

        this.refreshGrid();
      },

      convertToETH: function (wei) {
        return web3.utils.fromWei(wei.toString(), 'ether');
      },

      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployTokenContract: deployTokenContract,

      viewTokensBalance: viewTokensBalance,

      saveCrowdfundingContractToDB: saveCrowdfundingContractToDB,
      saveTokenContractToDB: saveTokenContractToDB
    }
  });
})();