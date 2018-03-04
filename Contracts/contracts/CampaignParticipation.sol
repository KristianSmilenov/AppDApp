pragma solidity ^0.4.18;

contract CampaignParticipation {

      struct Participant {
            address addr;
            uint8 donatedAmount;
      }

      address _donationAddress;
      uint8 _campaignId;
      uint8 _minFundingAmount;
      uint8 _commissionPercent;
      uint8 _foundersAddress;

      Participant[] public participants;
  
      function CampaignParticipation(address donationAddress, uint8 campaignId, uint8 minFundingAmount) public {
            _donationAddress = donationAddress;
            _campaignId = campaignId;
            _minFundingAmount = minFundingAmount;
      }

      function getCollectedAmount() view public returns (uint8) {
            return 0;
      }
      
      function getParticipationCount() view public returns (uint8) {
            return 0;
      }

      function receiveFunds() public {
            //this contract should be able to receive tokens
            // and store the info about who sent what
      }

      function triggerExecution() public {
            if (getCollectedAmount() >= _minFundingAmount)
            {
                  participateInEvent();
            } else {
                  returnMoneyToSenders();
            }
      }

      function participateInEvent() private {
            uint8 total = getCollectedAmount();
            uint8 commission = total * _commissionPercent;
            makeTransaction(_donationAddress, total - commission);
            makeTransaction(_foundersAddress, commission);
            //if anything fails, revert
      }

      function returnMoneyToSenders() private {
            for (uint8 i = 0; i < participants.length; i++) {
                  makeTransaction(participants[i].addr, participants[i].donatedAmount);
            }
      }

      function makeTransaction(address addr, uint8 amount) private {

      }
}
