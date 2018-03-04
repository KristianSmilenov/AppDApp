pragma solidity ^0.4.18;

contract CampaignParticipation {

      mapping(address => uint) public participation;
  
      function CampaignParticipation() public {
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
}
