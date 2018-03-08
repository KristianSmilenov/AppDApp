var Migrations = artifacts.require("./Migrations.sol");
var FundSharesToken = artifacts.require("./FundSharesToken.sol");
var CampaignTokenFundraiser = artifacts.require("./CampaignTokenFundraiser.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  //The end date of the fundraiser: Sunday, 2018-04-01 10:00:00 UTC
  deployer.deploy(FundSharesToken, "Shares Token 1", "ShT1", 10000000, 100).then(function () {
    return deployer.deploy(CampaignTokenFundraiser, FundSharesToken.address, 1522576800, 100, "Private sale, min $250k", 250);
  });

};
