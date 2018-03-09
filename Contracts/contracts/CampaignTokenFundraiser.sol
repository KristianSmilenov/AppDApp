pragma solidity ^0.4.18;

import './libraries/SafeMath.sol';
import './interfaces/ERC20Basic.sol';

//  TODO: Move money logic to a Vault contract

contract CampaignTokenFundraiser {
   
    using SafeMath for uint;

    enum State { CollectingFunds, WaitingForTokens, Refunding, Completed, Canceled }

    struct Participant {
        address addr;
        uint weiDonated;
    }

    /** 
     * @dev Access control modifier that allows only the current owner to call the function.
     */
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    event StateChanged(State state, string msg);

    // Account balances
    Participant[] public participants;

    //The current contract owner
    address public owner;

    //The current state of the campaign
    State public state;

    // Maximum gas price limit
    uint constant MAX_GAS_PRICE = 50000000000 wei; // 50 gwei/shanon

    // The address of the account which will receive the funds gathered by the campaign
    ERC20Basic public beneficiary;

    // The number of wei participants pay per token
    uint public conversionRate;

    //the date on which the campaign is closed
    uint public endDate;

    // Minimum amounts of Wei to be collected, before the campaign can be finalized
    uint public minCap;

    // Amount of wei collected during the campaign
    string public description;

    /**
     * @dev The constructor.
     * @param _beneficiary The address which will receive the funds gathered by the campaign
     */
    function CampaignTokenFundraiser(ERC20Basic _beneficiary,  uint _endDate, uint _conversionRate, string _description, uint _minCap) public {
        require(_beneficiary != address(0));

        beneficiary = _beneficiary;
        conversionRate = _conversionRate;
        endDate = _endDate;
        description = _description;
        minCap = _minCap;
        state = State.CollectingFunds;
        StateChanged(state, "CampaignTokenFundraiser");
        owner = msg.sender;
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
    }

    function invalidate() public onlyOwner {
        require(state == State.CollectingFunds);

        state = State.Refunding;
        StateChanged(state, "invalidate");
        refund();        
        state = State.Canceled;
        StateChanged(state, "invalidate");
    }

    function sendTokens() public {
        require(state == State.WaitingForTokens);

        for (uint i = 0; i < participants.length; i++) {
            uint tokens = participants[i].weiDonated.div(conversionRate);
            require(beneficiary.transfer(participants[i].addr, tokens));
        }
        
        state = State.Completed;
        StateChanged(state, "sendTokens");
    }

    function refund() public {
        require(state == State.Refunding);

        for (uint i = 0; i < participants.length; i++) {
            participants[i].addr.transfer(participants[i].weiDonated);
        }
    }

    function sendTokensToBeneficiary() private onlyOwner {
        address(beneficiary).call.value(this.balance)();
        state = State.WaitingForTokens;
        StateChanged(state, "sendTokensToBeneficiary");
    }

    function getCampaignBalance() view public returns (uint) {
        return this.balance;
    }
    
    function getParticipantsNumber() view public returns (uint) {
        return participants.length;
    }

    /**
     * @dev Close the campaign if `endDate` has not passed and if funds have been collected
     */
    function close() public onlyOwner {
        require(state == State.CollectingFunds);

        if (this.balance >= minCap && now <= endDate) {
            sendTokensToBeneficiary();
        } else {
            invalidate();
        }
    }
}
