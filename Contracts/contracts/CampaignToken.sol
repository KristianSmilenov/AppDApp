pragma solidity ^0.4.18;

import "./traits/HasOwner.sol";
import "./configs/TokenConfig.sol";
import "./traits/FreezableERC20Token.sol";


/**
 * @title Token
 *
 * @dev A standard token implementation of the ERC20 token standard with added
 *      HasOwner trait and initialized using the configuration constants.
 */
contract CampaignToken is TokenConfig, HasOwner, FreezableERC20Token {
    // The name of the token.
    string public name;

    // The symbol for the token.
    string public symbol;

    // The decimals of the token.
    uint8 public decimals;

    /**
     * @dev The constructor. Initially sets `totalSupply` and the balance of the
     *      `owner` address according to the initialization parameter.
     */
    function CampaignToken(uint _totalSupply) public HasOwner(msg.sender) {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
    }
}
