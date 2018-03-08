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
    uint256 public rate;

    function FundSharesToken(uint _totalSupply, uint256 _rate) public HasOwner(msg.sender) {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        totalSupply = _totalSupply;
        balances[owner] = _totalSupply;
        rate = _rate;
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
        //TODO: fix wei conversion rate
        //uint256 weiAmount = msg.value;
        //uint256 _tokenAmount = _getTokenAmount(weiAmount);
        this.transferPurchasedTokens(msg.sender, 13);
    }

    function transferPurchasedTokens(address _to, uint _value) public returns (bool success) {
        if (balances[owner] < _value || _value == 0) {
            return false;
        }

        balances[_to] = balances[_to].plus(_value);
        balances[owner] = balances[owner].minus(_value);

        Transfer(owner, _to, _value);

        return true;
    } 

    function _getTokenAmount(uint256 _weiAmount) public view returns (uint256) {
        return _weiAmount.mul(rate);
    }

}
