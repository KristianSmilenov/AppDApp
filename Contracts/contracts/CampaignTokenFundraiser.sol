pragma solidity ^0.4.18;

import './libraries/SafeMath.sol';
import './interfaces/ERC20Basic.sol';
import './traits/HasOwner.sol';

//  TODO: Move money logic to a Vault contract

contract CampaignTokenFundraiser is HasOwner {
   
    using SafeMath for uint;

    enum State { CollectingFunds, WaitingForTokens, Refunding, Completed, Canceled }

    struct Participant {
        address addr;
        uint weiDonated;
    }

    // Account balances
    Participant[] participants;

    //The current state of the campaign
    State public state;

    // Maximum gas price limit
    uint constant MAX_GAS_PRICE = 50000000000 wei; // 50 gwei/shanon

    // The address of the account which will receive the funds gathered by the campaign
    ERC20Basic public beneficiary;

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
     * @param _beneficiary The address which will receive the funds gathered by the campaign
     */
    function CampaignTokenFundraiser(ERC20Basic _beneficiary,  uint _endDate,
    uint _conversionRate, string _description, uint _minCap) public {
        require(_beneficiary != address(0));

        beneficiary = _beneficiary;
        conversionRate = _conversionRate;
        endDate = _endDate;
        weiCollected = 0;
        description = _description;
        minCap = _minCap;
        state = State.CollectingFunds;
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
        require(state == State.CollectingFunds);
        require(now <= endDate);
        require(tx.gasprice <= MAX_GAS_PRICE);  // gas price limit

        participants.push(Participant(msg.sender, msg.value));

        weiCollected = weiCollected.plus(msg.value);
    }

    function invalidate() public onlyOwner {
        require(state == State.CollectingFunds);

        state = State.Refunding;
        refund();        
        state = State.Canceled;
    }

    function sendTokens() public {
        require(state == State.WaitingForTokens);

        for (uint i = 0; i <= participants.length; i++) {
            uint tokens = participants[i].weiDonated.mul(conversionRate);
            beneficiary.transfer(participants[i].addr, tokens);
        }
        
        state = State.Completed;
    }

    function refund() public {
        require(state == State.Refunding);

        for (uint i = 0; i <= participants.length; i++) {
            participants[i].addr.transfer(participants[i].weiDonated);
        }
    }

    function sendTokensToBeneficiary() private onlyOwner {
        beneficiary.transfer(beneficiary, this.balance);
        state = State.WaitingForTokens;
    }

    function getCampaignBalance() view public returns (uint) {
        return this.balance;
    }
    
    function getParticipantsNumber() view public returns (uint) {
        return participants.length;
    }

    /**
     * @dev Close the campaign if `endDate` has passed and if funds have been collected
     */
    function close() public onlyOwner {
        require(state == State.CollectingFunds);
        require(now >= endDate);

        if (weiCollected >= minCap) {
            sendTokensToBeneficiary();
        } else {
            invalidate();
        }
    }
}
