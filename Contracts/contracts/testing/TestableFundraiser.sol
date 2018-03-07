pragma solidity ^0.4.19;

import "../CampaignTokenFundraiser.sol";

contract TestableFundraiser is CampaignTokenFundraiser {
    uint internal utIndividualLimitEther;

    function TestableFundraiser (address _beneficiary, uint _conversionRate, uint _startDate, uint _endDate,
        uint _hardCap, uint _minimumContribution, uint _individualLimit) public CampaignTokenFundraiser(_beneficiary) 
    {
        conversionRate = _conversionRate;
        startDate = _startDate;
        endDate = _endDate;
        hardCap = _hardCap;
        minimumContribution = _minimumContribution;
        individualLimit = _individualLimit * _conversionRate;
        utIndividualLimitEther = _individualLimit;
    }

    // @dev Override the fundraiser function to set the conversion rate using
    function setConversionRate(uint _conversionRate) public onlyOwner {
        super.setConversionRate(_conversionRate);
        individualLimit = utIndividualLimitEther * _conversionRate;
    }

    // @dev Exposed internal variables
    function internalMinimumContribution() public view returns (uint) {
        return minimumContribution;
    }

    function internalIndividualLimit() public view returns (uint) {
        return individualLimit;
    }
}
