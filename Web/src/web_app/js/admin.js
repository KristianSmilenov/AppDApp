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
      crowdfundingContract_tokensPerEth: 10000,
      crowdfundingContract_description: 'Pre-sale #1',
      crowdfundingContract_minCap: 25,

      // Used when creating new token
      tokenContract_name: 'Crypto Investoment Fund',
      tokenContract_symbol: 'CIF',
      tokenContract_totalSupply: '10000000', // Total supply 10 MM CIF * ~0.10$ = ~1MM
      tokenContract_tokensPerEth: '10000', // User will get 10k CIF for 1 ETH ~0.10$ / CIF
      tokenContract_minInvestment: '25', // 25 ETH ~25000$

      // Show user token balance for selected contract
      selectedTokenContractSymbol: '',
      selectedTokenContractAddress: '',
      tokenContractUserAddress: '',

      myMetaMaskAddress: '',
      userAddress: '',
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

      loadMyMetaMaskAddress: async function() {
        var address = await getMetaMaskAccount();
        this.myMetaMaskAddress = address;
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
            //TODO: load data from Blockchain
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
            else showSuccess('Campaign invalidated', result);
          }).on('transactionHash', (transactionHash) => {
            showSuccess('Invalidating campaign', 'Transaction hash: ' + transactionHash);
         });
      },

      closeCampaign: async function (campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.close().send(
          { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if (error) showError(error);
            else showSuccess('Campaign closed', result);
          }).on('transactionHash', (transactionHash) => {
            showSuccess('Closing campaign', 'Transaction hash: ' + transactionHash);
         });
      },

      finalizeCampaign: async function (campaignAddress) {
        var userAddress = await getMetaMaskAccount();
        var fundraiserContract = await getContractByAddress('CampaignTokenFundraiser', campaignAddress);

        fundraiserContract.methods.sendTokens().send(
          { from: userAddress, gas: gas, gasPrice: gasPrice }, function (error, result) {
            if (error) showError(error);
            else showSuccess('Campaign finalized', result);
          }).on('transactionHash', (transactionHash) => {
            showSuccess('Finalizing campaign', 'Transaction hash: ' + transactionHash);
         });
      },

      refreshGrid: function () {
        var b = this.savedCampaigns;
        this.savedCampaigns = [];
        this.savedCampaigns = b;
      },

      refreshCampaignData: async function (campaignAddress) {
        var state = await getCampaignState(campaignAddress);
        var bal = await getCampaignBalance(campaignAddress);
        var count = await getCampaignParticipantsCount(campaignAddress);
        
        var campaign = this.savedCampaigns.find(c => c.fundraiserContractAddress == campaignAddress);
        campaign.state = state;
        campaign.balance = bal;
        campaign.participantCount = count;
        campaign.progress = parseInt(Math.min(100, Number(bal) / campaign.minCap * 100));
        this.refreshGrid();
      },

      contributeToCampaign: async function (campaignAddress) {
        await contributeToCampaign(campaignAddress, await getMetaMaskAccount(), 0.01);
      },

      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployTokenContract: deployTokenContract,

      viewTokensBalance: viewTokensBalance,

      saveCrowdfundingContractToDB: saveCrowdfundingContractToDB,
      saveTokenContractToDB: saveTokenContractToDB,

      convertToEther: convertToEther,
      convertToWei: convertToWei
    }
  });
})();