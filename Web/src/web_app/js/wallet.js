(function () {

  initWeb3();

  var app = new Vue({
    el: '#app',
    data: {
      crowdfundingContract_beneficiaryAddress: '',
      crowdfundingContract_endDate: '1522576800',
      crowdfundingContract_conversionRate: 1000,
      crowdfundingContract_description: 'Pre-sale #1',
      crowdfundingContract_minCap: 1000,
      userAddress: '',
      sendToAddress: '',
      sendValueAmount: '',
      savedContracts: 'asd',
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
      getMetaMaskAccount: async function() {
        this.userAddress = await getMetaMaskAccount();
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