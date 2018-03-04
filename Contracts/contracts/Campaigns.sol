pragma solidity ^0.4.18;

contract Campaigns {

      struct Campaign {
            bool isActive;
            string hashHex;
      }

      mapping(uint8 => Campaign) public campaigns;
  
      function Campaigns() public {
      }

      function getCampaignHash(uint8 id) view public returns (string) {
            return campaigns[id].hashHex;
      }

      function addCampaign(uint8 id, bool isActive, string campaignHash) public {
            campaigns[id] = Campaign(isActive, campaignHash);
      }

      function closeCampaign(uint8 id) public {
          campaigns[id].isActive = false;
      }
}
