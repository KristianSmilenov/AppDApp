pragma solidity ^0.4.18;

import "./RefundableCrowdsale.sol";
import "./ERC20Basic.sol";
import "./SimpleCampaignToken.sol";

/**
 * @title SampleCrowdsale
 * @dev This is an example of a fully fledged crowdsale.
 * The way to add new features to a base crowdsale is by multiple inheritance.
 * In this example we are providing following extensions:
 * CappedCrowdsale - sets a max boundary for raised funds
 * RefundableCrowdsale - set a min goal to be reached and returns funds if it's not met
 *
 * After adding multiple features it's good practice to run integration tests
 * to ensure that subcontracts works together as intended.
 */
contract CampaignCrowdfunding is RefundableCrowdsale {

  function CampaignCrowdfunding(uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, SimpleCampaignToken _token, uint256 _goal) public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
    RefundableCrowdsale(_goal) {
  }
}
