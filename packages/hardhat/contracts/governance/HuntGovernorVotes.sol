// SPDX-License-Identifier: Apache
// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";

abstract contract HuntGovernorVotes is GovernorVotesUpgradeable {

    ERC20VotesUpgradeable private _token;

    function __HuntGovernorVotes_init(IVotesUpgradeable tokenAddress) internal onlyInitializing {
        __GovernorVotes_init(tokenAddress);
    }
    constructor() {}

    /**
     * Read the voting weight from the token's built in snapshot mechanism (see {Governor-_getVotes}).
     */
    function _getVotes(
        address account,
        uint256 blockNumber,
        bytes memory /*params*/
    ) internal view virtual override returns (uint256) {
        if (_token.getPastVotes(account, blockNumber) > 0) {
            return 1;
        } else {
            return 0;
        }
    }

     /**
     * @param account - Address of account to check. 
     * @return return the voting units held by an account.
     */
    function _getVotingUnits(address account) internal view returns (uint256) {
        if (_token.balanceOf(account) > 0) {
            return 1;
        } else {
            return 0;
        }
    }

}