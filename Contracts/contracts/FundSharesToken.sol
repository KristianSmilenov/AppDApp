pragma solidity ^0.4.18;

import "./traits/HasOwner.sol";
import './libraries/SafeMath.sol';
import "./interfaces/ERC20Basic.sol";

contract FundSharesToken is HasOwner, ERC20Basic {
    using SafeMath for uint;

    mapping (address => uint) balances;

    string public name;
    string public symbol;
    uint public totalSupply;
    uint8 public decimals = 18;
    // conversion rate 1ETH <> X Tokens
    uint public conversionRate;

    function FundSharesToken(string _name, string _symbol, uint _totalSupply, uint _rate) public HasOwner(msg.sender) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
        conversionRate = _rate;
    }

    function totalSupply() public view returns (uint) {
        return totalSupply;
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

    function setConversionRate(uint _rate) public onlyOwner {
        require(conversionRate > 0);
        conversionRate = _rate;
    }

    function () external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        uint weiAmount = msg.value;
        uint _tokenAmount = _getTokensAmount(weiAmount);
        _transferPurchasedTokens(msg.sender, _tokenAmount);
    }

    function _transferPurchasedTokens(address _to, uint _value) internal {
        require(balances[owner] > _value);
        require(_value > 0);

        balances[_to] = balances[_to].plus(_value);
        balances[owner] = balances[owner].minus(_value);

        Transfer(owner, _to, _value);
    } 

    function _getTokensAmount(uint _weiAmount) internal view returns (uint) {
        uint ethAmount = _weiAmount / (1 ether);
        return ethAmount.mul(conversionRate);
    }

}
