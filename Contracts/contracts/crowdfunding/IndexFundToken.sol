pragma solidity ^0.4.18;

import "./ERC20Basic.sol";
import "./SafeMath.sol";

contract IndexFundToken is ERC20Basic {
    using SafeMath for uint256;

    mapping(address => uint256) balances;
    uint256 totalSupply_;
    string public name;
    uint8 public decimals;
    string public symbol;
    // How many token units a buyer gets per wei
    uint256 public rate;
    string public version = "0.0.1";

    function IndexFundToken (uint256 _initialAmount) public {

        //TODO: Add list of items in the index: btc,eth,etc...
        // , string _tokenName, uint8 _decimalUnits, string _tokenSymbol, uint256 _rate

        balances[msg.sender] = _initialAmount;
        totalSupply_ = _initialAmount;
        name = "Index Fund Token";
        decimals = 18;
        symbol = "IFT";
        rate = 1;
    }

    function () external payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address _beneficiary) public payable {
        uint256 weiAmount = msg.value;
        uint256 _tokenAmount = _getTokenAmount(weiAmount);
        balances[_beneficiary] = balances[_beneficiary].add(_tokenAmount);
        this.transfer(_beneficiary, _tokenAmount);
    }

    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        return _weiAmount.mul(rate);
    }

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

}