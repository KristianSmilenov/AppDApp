'use strict';

window.addEventListener('load', () => {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.')
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    console.log('Web3 injected browser: Fail. You should consider trying MetaMask.')
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }

  startApp();
})

function startApp() {
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!'
    },
    methods: {
      contributeToCampaign: function () {
        //TODO: Make sure CampaignToken and CampaignTokenFundraiser are deployed
        let contractAddress = "";
      }
    }
  });
}