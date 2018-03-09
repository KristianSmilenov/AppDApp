pragma solidity ^0.4.19;

contract SimpleContract {

    function SimpleContract() public {
    }

    function () external payable {
    }

    function receiveEthers(uint _weiAmount) public payable {
    }

    function getEthers(uint _weiAmount) public {
        msg.sender.transfer(_weiAmount);
    }

    function sendEthersToWallet(address _addr, uint _weiAmount) public {
        _addr.transfer(_weiAmount);
    }

    function sendEthersToContract(address _addr, uint _weiAmount) public {
        _addr.call.value(_weiAmount)();
    }

    function getBalance() public view returns (uint) {
        return this.balance;
    }

}
