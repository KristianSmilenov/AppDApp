pragma solidity ^0.4.18;

import "./traits/HasOwner.sol";
import "./configs/TokenConfig.sol";
import './libraries/SafeMath.sol';
import "./interfaces/ERC20TokenInterface.sol";

contract FundSharesToken is TokenConfig, HasOwner, ERC20TokenInterface {
    using SafeMath for uint;

    mapping (address => uint) balances;
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _conversionRate;

    function FundSharesToken(uint _totalSupply, uint256 _rate) public HasOwner(msg.sender) {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
        _conversionRate = _rate;
    }

    function balanceOf(address _account) public constant returns (uint balance) {
        return balances[_account];
    }

    function transfer(address _to, uint _value) public returns (bool success) {
        if (balances[msg.sender] < _value || _value == 0) {

            return false;
        }

        balances[msg.sender] -= _value;
        balances[_to] = balances[_to].plus(_value);

        Transfer(msg.sender, _to, _value);

        return true;
    }

    function () external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        uint256 weiAmount = msg.value;
        uint256 _tokenAmount = _getTokenAmount(weiAmount);
        _transferPurchasedTokens(msg.sender, _tokenAmount);
    }

    function _transferPurchasedTokens(address _to, uint _value) internal returns (bool success) {
        if (balances[owner] < _value || _value == 0) {
            return false;
        }

        balances[_to] = balances[_to].plus(_value);
        balances[owner] = balances[owner].minus(_value);

        Transfer(owner, _to, _value);

        return true;
    } 

    /**
     * @dev Gets the number of tokens to be distributed according to _conversionRate
     */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint256 ethAmount = _weiAmount / (1 ether);
        return ethAmount.mul(_conversionRate);
    }

    /**
     * @dev Sets conversion rate of 1 ETH to TOKEN
     */
    function setConversionRate(uint _rate) public onlyOwner {
        require(_conversionRate > 0);
        _conversionRate = _rate;
    }

}
