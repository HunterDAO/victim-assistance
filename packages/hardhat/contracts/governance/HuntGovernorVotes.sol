// SPDX-License-Identifier: Apache
// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "../tokens/HuntToken.sol";
import "../tokens/DonorRewardsNFT.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";

abstract contract HuntGovernorVotes is GovernorVotesUpgradeable {

    uint256 private nHuntTokens;

    HuntToken private hunt;
    DonorRewardsNFT private donorRewards;

    function __HuntGovernorVotes_init(
        uint256 _nHuntTokens,
        HuntToken _hunt,
        DonorRewardsNFT _donorRewards
    )
        internal
        onlyInitializing
    {
        __GovernorVotes_init(_hunt);
        __HuntGovernorVotes_init_unchained(
            _nHuntTokens,
            _hunt,
            _donorRewards
        );
    }

    function __HuntGovernorVotes_init_unchained(
        uint256 _nHuntTokens,
        HuntToken _hunt,
        DonorRewardsNFT _donorRewards
    )
        internal
        onlyInitializing
    {
        nHuntTokens = _nHuntTokens;
        hunt = _hunt;
        donorRewards = _donorRewards;
    }
    
    constructor() {}

    /**
     * Read the voting weight from the token's built in snapshot mechanism (see {Governor-_getVotes}).
     */
    // function _getVotes(
    //     address account,
    //     uint256 blockNumber,
    //     bytes memory /*params*/
    // ) internal view virtual override returns (uint256) {
    //     // return getVotes(account, blockNumber);
    //     return _getVotingUnits(account);
    // }

    // function _getPastVotes(
    //     address account,
    //     uint256 blockNumber
    // )
    //     public
    //     view
    //     returns (uint256)
    // {
    //     return hunt.getPastVotes(
    //         account,
    //         blockNumber
    //     );
    // }

    /**
     * Read the voting weight from the token's built in snapshot mechanism (see {Governor-_getVotes}).
     */
    // function _getPastVotes(
    //     address account,
    //     uint256 blockNumber,
    //     bytes memory /*params*/
    // ) internal view virtual override returns (uint256) {
    //     // return getVotes(account, blockNumber);
    //     return _getVotingUnits(account);
    // }

     /**
     * @param account - Address of account to check. 
     * @return return the voting units held by an account.
     */
    function _getVotingUnits(address account) internal view returns (uint256) {
        if ((hunt.balanceOf(account) > nHuntTokens) || (donorRewards.balanceOf(account) > 0)) {
            return 1;
        } else {
            return 0;
        }
    }

}