pragma solidity ^0.4.18;

import "./traits/HasOwner.sol";
import "./configs/TokenConfig.sol";
import "./traits/FreezableERC20Token.sol";

contract CampaignToken is TokenConfig, HasOwner, FreezableERC20Token {
    string public name;
    string public symbol;
    uint8 public decimals;

    function CampaignToken(uint _totalSupply) public HasOwner(msg.sender) {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
    }
}
