// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "./HuntRegistry.sol";
import "../tokens/HuntToken.sol";
import "../tokens/DonorRewardsNFT.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";

abstract contract HuntGovernorQuorum is GovernorVotesQuorumFractionUpgradeable {

    HuntToken private hunt;
    DonorRewardsNFT private donorRewards;

    uint256 private _quorumDenominator;

    event QuorumDenominatorUpdated(uint256 oldQuorumDenominator, uint256 newQuorumDenominator);

    function __HuntGovernorQuorum_init(
        uint256 _numerator,
        address _registry
    )
        internal
        onlyInitializing
    {
        __HuntGovernorQuorum_init_unchained(_registry);
        __GovernorVotesQuorumFraction_init(_numerator);
    }

    function __HuntGovernorQuorum_init_unchained(
        address _registry
    ) 
        internal
        onlyInitializing
    {
        HuntRegistry registry = HuntRegistry(_registry);
        hunt = HuntToken(registry.hunt());
        donorRewards = DonorRewardsNFT(registry.donorRewards());
        _quorumDenominator = quorumDenominator();
    }

    constructor() {}

    /**
     * @dev Returns the quorum denominator. Defaults to 100, but may be overridden.
     */
    function quorumDenominator() public view override returns (uint256) {
        return hunt.getVoters() + donorRewards.getVoters();
    }

    /**
     * @dev TODO: Audit
     * @dev Returns the quorum for a block number, in terms of number of votes: `supply * numerator / denominator`.
     */
    function quorum(
        uint256 blockNumber
    )
        public
        view
        virtual
        override
        returns (uint256)
    {
        // return ((hunt.getPastVoters(blockNumber) + donorRewards.getPastVoters(blockNumber)) * quorumNumerator()) / quorumDenominator();
        return quorumNumerator() / quorumDenominator();
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
    function updateQuorumDenominator(
        uint256 newQuorumDenominator
    )
        external
        virtual
        onlyGovernance
    {
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
    function _updateQuorumDenominator(
        uint256 newQuorumDenominator
    )
        internal
        virtual
    {
        require(
            quorumNumerator() <= newQuorumDenominator,
            "HuntGovernorQuorum: quorumNumerator over quorumDenominator"
        );

        uint256 oldQuorumDenominator = _quorumDenominator;
        _quorumDenominator = newQuorumDenominator;

        emit QuorumDenominatorUpdated(oldQuorumDenominator, newQuorumDenominator);
    }

}