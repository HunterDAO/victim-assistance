// SPDX-License-Identifier: Apache
// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "../tokens/HuntToken.sol";
import "../tokens/DonorRewardsNFT.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";

abstract contract HuntGovernorQuorum is GovernorVotesQuorumFractionUpgradeable {

    HuntToken private hunt;
    DonorRewardsNFT private donorRewards;

    uint256 private _quorumDenominator;

    event QuorumDenominatorUpdated(uint256 oldQuorumDenominator, uint256 newQuorumDenominator);

    function __HuntGovernorQuorum_init(uint256 _numerator, uint256 _denominator, HuntToken _hunt) internal onlyInitializing {
        hunt = _hunt;
        _quorumDenominator = _denominator;
        __GovernorVotesQuorumFraction_init(_numerator);
    }
    constructor() {}

    /**
     * @dev Returns the quorum denominator. Defaults to 100, but may be overridden.
     */
    function quorumDenominator() public view virtual override returns (uint256) {
        return hunt.getNumVoters() + donorRewards.getNumVoters();
    }

    /**
     * @dev Returns the quorum for a block number, in terms of number of votes: `supply * numerator / denominator`.
     */
    function quorum(uint256 blockNumber) public view virtual override returns (uint256) {
        return ((hunt.getPastNumVoters(blockNumber) + donorRewards.getPastNumVoters(blockNumber)) * quorumNumerator()) / quorumDenominator();
    }

    /**
     * @dev Changes the quorum numerator.
     *
     * Emits a {QuorumNumeratorUpdated} event.
     *
     * Requirements:
     *
     * - Must be called through a governance proposal.
     * - New numerator must be smaller or equal to the denominator.
     */
    function updateQuorumDenominator(uint256 newQuorumDenominator) external virtual onlyGovernance {
        _updateQuorumDenominator(newQuorumDenominator);
    }

    /**
     * @dev Changes the quorum numerator.
     *
     * Emits a {QuorumDenominatorUpdated} event.
     *
     * Requirements:
     *
     * - New numerator must be smaller or equal to the denominator.
     */
    function _updateQuorumDenominator(uint256 newQuorumDenominator) internal virtual {
        require(
            quorumNumerator() <= newQuorumDenominator,
            "HuntGovernorQuorum: quorumNumerator over quorumDenominator"
        );

        uint256 oldQuorumDenominator = _quorumDenominator;
        _quorumDenominator = newQuorumDenominator;

        emit QuorumDenominatorUpdated(oldQuorumDenominator, newQuorumDenominator);
    }

}