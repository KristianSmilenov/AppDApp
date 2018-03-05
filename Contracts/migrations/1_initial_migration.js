var Migrations = artifacts.require("./Migrations.sol");
var CampaignTokenFundraiser = artifacts.require("./CampaignTokenFundraiser.sol");
var CampaignToken = artifacts.require("./CampaignToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(CampaignToken, 10000);
  deployer.deploy(CampaignTokenFundraiser, '0x627306090abaB3A6e1400e9345bC60c78a8BEf57');
};
