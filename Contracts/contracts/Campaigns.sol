pragma solidity ^0.4.18;

contract Campaigns {

      struct Campaign {
            bool isActive;
            string hashHex;
      }

      mapping(string => Campaign) private campaigns;
  
      function Campaigns() public {
      }

      function getCampaignHash(string id) view public returns (string) {
            return  campaigns[id].hashHex;
      }

      function addCampaign(string id, bool isActive, string campaignHash) public {
            campaigns[id] = Campaign(isActive, campaignHash);
      }

      function closeCampaign(string id) public {
          campaigns[id].isActive = false;
      }
}
