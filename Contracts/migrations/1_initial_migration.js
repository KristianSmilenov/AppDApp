var Migrations = artifacts.require("./Migrations.sol");
// var CampaignTokenFundraiser = artifacts.require("./CampaignTokenFundraiser.sol");
// var CampaignToken = artifacts.require("./CampaignToken.sol");
var CampaignCrowdfunding = artifacts.require("./CampaignCrowdfunding.sol");
var SimpleCampaignToken = artifacts.require("./SimpleCampaignToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  // deployer.deploy(CampaignToken, 10000);
  // deployer.deploy(CampaignTokenFundraiser, '0x627306090abaB3A6e1400e9345bC60c78a8BEf57');
  // (uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, SimpleCampaignToken _token, uint256 _goal)
  // @param _token Address of the token being sold
  deployer.deploy(SimpleCampaignToken).then(function() {
    return deployer.deploy(CampaignCrowdfunding, 1518688800, 1522576800, 9000, "0xd1504be4ad3738f16194591baa924e9882c39ad5",
    SimpleCampaignToken.address,  5000000000000000000); // 5 eth goal
  });
  
};
