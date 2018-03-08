pragma solidity ^0.4.18;

import "./traits/HasOwner.sol";
import "./configs/TokenConfig.sol";
import './libraries/SafeMath.sol';
import "./interfaces/ERC20TokenInterface.sol";

contract CampaignToken is TokenConfig, HasOwner, ERC20TokenInterface {
    using SafeMath for uint;

    mapping (address => uint) balances;
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public rate;

    function CampaignToken(uint _totalSupply, uint256 _rate) public HasOwner(msg.sender) {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
        rate = _rate;
    }

    /**
     * @dev Checks the balance of a certain address.
     */
    function balanceOf(address _account) public constant returns (uint balance) {
        return balances[_account];
    }

    /**
     * @dev Transfers tokens from one address to another.
     *
     * @param _to The target address to which the `_value` number of tokens will be sent.
     * @param _value The number of tokens to send.
     *
     * @return Whether the transfer was successful or not.
     */
    function transfer(address _to, uint _value) public returns (bool success) {
        if (balances[msg.sender] < _value || _value == 0) {

            return false;
        }

        balances[msg.sender] -= _value;
        balances[_to] = balances[_to].plus(_value);

        Transfer(msg.sender, _to, _value);

        return true;
    }

    /**
     * @dev Send `_value` tokens to `_to` from `_from`
     *
     * @param _from The address of the sender.
     * @param _to The address of the recipient.
     * @param _value The number of tokens to be transferred.
     *
     * @return Whether the transfer was successful or not.
     */
    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        if (balances[_from] < _value || _value == 0) {
            return false;
        }

        balances[_to] = balances[_to].plus(_value);
        balances[_from] -= _value;

        Transfer(_from, _to, _value);

        return true;
    } 

    function () external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        uint256 weiAmount = msg.value;
        uint256 _tokenAmount = _getTokenAmount(weiAmount);
        this.transferFrom(owner, msg.sender, _tokenAmount);
    }

    function _getTokenAmount(uint256 _weiAmount) public view returns (uint256) {
        return _weiAmount.mul(rate);
    }

}
