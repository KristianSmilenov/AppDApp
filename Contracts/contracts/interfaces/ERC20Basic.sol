pragma solidity ^0.4.18;

contract ERC20Basic {
  function totalSupply() public view returns (uint);
  function balanceOf(address _owner) public view returns (uint);
  function transfer(address _to, uint _value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint value);
}
