pragma solidity ^0.4.19;

import './TokenConfig.sol';


/**
 * @title TokenFundraiserConfig
 *
 * @dev The static configuration for the Token fundraiser.
 */
contract TokenFundraiserConfig is TokenConfig {
    // The number of CAM per 1 ETH.
    uint constant CONVERSION_RATE = 9000;

    // The public sale hard cap of the fundraiser.
    uint constant TOKENS_HARD_CAP = 71250 * (10**3) * DECIMALS_FACTOR;

    // The start date of the fundraiser: Thursday, 2018-02-15 10:00:00 UTC.
    uint constant START_DATE = 1518688800;

    // The end date of the fundraiser: Sunday, 2018-04-01 10:00:00 UTC (45 days after `START_DATE`).
    uint constant END_DATE = 1522576800;
    
    // Total number of tokens locked for the fund management team.
    uint constant TOKENS_LOCKED_FUND_MANAGEMENT_TEAM = 12 * (10**6) * DECIMALS_FACTOR;

    // The release date for tokens locked for the fund management team.
    uint constant TOKENS_LOCKED_FUND_MANAGEMENT_TEAM_RELEASE_DATE = START_DATE + 1 years;

    // Maximum gas price limit
    uint constant MAX_GAS_PRICE = 50000000000 wei; // 50 gwei/shanon

    // Minimum individual contribution
    uint constant MIN_CONTRIBUTION =  0.1 ether;

    // Individual limit in ether
    uint constant INDIVIDUAL_ETHER_LIMIT =  9 ether;
}
