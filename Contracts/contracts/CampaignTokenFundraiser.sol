pragma solidity ^0.4.18;

import './libraries/SafeMath.sol';
import './interfaces/ERC20TokenInterface.sol';
import './traits/HasOwner.sol';

//  TODO: add refundVault
//  TODO: add finalize logic
//  TODO: pass all data via constructor

contract CampaignTokenFundraiser is HasOwner {
   
    using SafeMath for uint;

    struct Participant {
        address addr;
        uint weiDonated;
    }
    // Account balances
    Participant[] participants;

    // Maximum gas price limit
    uint constant MAX_GAS_PRICE = 50000000000 wei; // 50 gwei/shanon

    // Indicates whether the campaign has ended or not
    bool public finalized = false;

    // The address of the account which will receive the funds gathered by the campaign
    ERC20TokenInterface public beneficiary;

    // The number of tokens participants will receive per 1 wei
    uint public conversionRate;

    //the date on which the campaign is closed
    uint public endDate;

    // Minimum amounts of wei to be collected, before the campaign can be finalized
    uint public minCap;

    // Amount of wei collected during the campaign
    uint public weiCollected;

    // Amount of wei collected during the campaign
    string public description;

    /**
     * @dev The constructor.
     *
     * @param _beneficiary The address which will receive the funds gathered by the campaign
     */
    function CampaignTokenFundraiser(ERC20TokenInterface _beneficiary,  uint _endDate, uint _conversionRate) public {
        require(_beneficiary != address(0));

        beneficiary = _beneficiary;
        conversionRate = _conversionRate;
        endDate = _endDate;
        weiCollected = 0;
    }

    /**
     * @dev The default function which will fire every time someone sends ethers to this contract's address.
     */
    function() public payable {
        buyTokens();
    }

    /**
     * @dev Allows users to participate in the pre-sale crowdfunding
     */
    function buyTokens() public payable {
        require(!finalized);
        require(now <= endDate);
        require(tx.gasprice <= MAX_GAS_PRICE);  // gas price limit

        participants.push(Participant(msg.sender, msg.value));

        weiCollected = weiCollected.plus(msg.value);
    }

    function invalidate() public onlyOwner {
        //TODO: implement
        finalized = true;
    }

    function sendTokens() public {
        for (uint i = 0; i <= participants.length; i++) {
            uint tokens = participants[i].weiDonated.mul(conversionRate);
            beneficiary.transfer(participants[i].addr, tokens);
        }
    }

    function refund() public {
        require(finalized);
        for (uint i = 0; i <= participants.length; i++) {
            participants[i].addr.send(participants[i].weiDonated);
        }
    }

    /**
     * @dev Finalize the campaign if `endDate` has passed and if funds have been collected
     */
    function finalize() public onlyOwner {
        require(weiCollected >= minCap && now >= endDate);
        require(!finalized);

        /// Send the total number of ETH gathered to the beneficiary.
        beneficiary.transfer(beneficiary, this.balance);

        /// Finalize the campaign. Cannot be undone!
        finalized = true;
    }
}
