pragma solidity ^0.4.18;
// We have to specify what version of compiler this code will compile with

contract Voting {
  
  uint8 public votesReceived;
  
  function Voting() public {
  }

  // This function returns the total votes a candidate has received so far
  function getVotes() view public returns (uint8) {
        return votesReceived;
  }

  
  // This function returns the total votes a candidate has received so far
  function incrementVotes() public returns (uint8) {
        votesReceived += 1;
        return votesReceived;
  }
}