var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
  deployer.deploy(() => Voting([1,2,3,4]));
};

module.exports = function(deployer) {
  deployer.deploy(Campaigns);
};
