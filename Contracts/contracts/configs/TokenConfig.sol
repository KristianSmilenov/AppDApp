pragma solidity ^0.4.18;

contract TokenConfig {
    string constant NAME = "Token";
    string constant SYMBOL = "TOKEN";
    uint8 constant DECIMALS = 18;
    uint constant DECIMALS_FACTOR = 10 ** uint(DECIMALS);
}
