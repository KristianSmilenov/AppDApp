pragma solidity ^0.4.19;

import "./configs/TokenFundraiserConfig.sol";
import "./libraries/SafeMath.sol";
import "./traits/TokenSafe.sol";

/**
 * @dev The Campaigns Safe contains all details about locked tokens.
 */
contract CampaignSafe is TokenSafe, TokenFundraiserConfig {
    // Bundle type constants
    uint8 constant FUND_MANAGER_TEAM = 0;

    /**
     * @param _token The address of the fundraiser contract.
     */
    function CampaignSafe(address _token) public TokenSafe(_token) {
        token = ERC20TokenInterface(_token);

        /// Fund manager team
        initBundle(FUND_MANAGER_TEAM, TOKENS_LOCKED_FUND_MANAGEMENT_TEAM_RELEASE_DATE);

        // Accounts with tokens locked for the fund manager team.
        addLockedAccount(FUND_MANAGER_TEAM, 0xB494096548aA049C066289A083204E923cBf4413, 4 * (10**6) * DECIMALS_FACTOR);
        addLockedAccount(FUND_MANAGER_TEAM, 0xE3506B01Bee377829ee3CffD8bae650e990c5d68, 4 * (10**6) * DECIMALS_FACTOR);

        // Verify that the tokens add up to the constant in the configuration.
        assert(bundles[FUND_MANAGER_TEAM].lockedTokens == TOKENS_LOCKED_FUND_MANAGEMENT_TEAM);
    }

    /**
     * @dev Returns the total locked tokens. This function is called by the fundraiser to determine number of tokens to create upon finalization.
     */
    function totalTokensLocked() public constant returns (uint) {
        return bundles[FUND_MANAGER_TEAM].lockedTokens;
    }

    /**
     * @dev Allows fun manager account to be released.
     */
    function releaseCoreTeamAccount() public {
        releaseAccount(FUND_MANAGER_TEAM, msg.sender);
    }
}
