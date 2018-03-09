(function () {

  initWeb3();
  initAccount();

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
      config: {
        gasPrice: 5000000000, //(5 Shannon)
        gas: 4312388,
        salt: "m/0'/0'/0'",
        ethToWei: 1.0e18,
        ethHost: "http://localhost:8545"
      },
      api: {
        base: "http://localhost:10010",
        campaigns: "/campaigns",
        contracts: "/contracts"
      },
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
      getMetaMaskAccount: getMetaMaskAccount,
      
      deployContract: deployContract,
      deployCrowdfundingContract: deployCrowdfundingContract,
      deployFundsharesToken: deployFundsharesToken,

      getCampaignContractData: getCampaignContractData,
      getCampaignParticipantsData: getCampaignParticipantsData,        
      finalizeCampaign: finalizeCampaign,
      contributeToCampaign: contributeToCampaign,

      viewPurchasedFundshares: viewPurchasedFundshares,
      purchaseFundshares: purchaseFundshares,
      sendEthToFundshares: sendEthToFundshares,

      saveContractToDB: saveContractToDB,
      getContractsFromDB: getContractsFromDB,
    }
  });
})();