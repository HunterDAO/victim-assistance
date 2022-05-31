// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntGovernorVotes.sol";
import "./HuntGovernorQuorum.sol";
import "../tokens/HuntToken.sol";
import "../tokens/DonorRewardsNFT.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";

/// @custom:security-contact admin@hunterdao.io
contract HuntGovernor is Initializable, GovernorUpgradeable, GovernorSettingsUpgradeable, GovernorCountingSimpleUpgradeable, HuntGovernorVotes, HuntGovernorQuorum, GovernorTimelockControlUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        HuntToken _hunt,
        DonorRewardsNFT _donorRewards,
        TimelockControllerUpgradeable _timelock
    )
        initializer
        public
    {
        __Governor_init("HuntGovernor");
        __GovernorSettings_init(13091 /* 2 days */, 32727 /* 5 days */, 1);
        __GovernorCountingSimple_init();
        __HuntGovernorVotes_init(500, _hunt, _donorRewards);
        __HuntGovernorQuorum_init(4, _hunt, _donorRewards);
        __GovernorTimelockControl_init(_timelock);
    }

    // The following functions are overrides required by Solidity.

    function votingDelay()
        public
        view
        override(IGovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernorUpgradeable, HuntGovernorQuorum)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public
        override(GovernorUpgradeable, IGovernorUpgradeable)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    // function _getVotes(
    //     address account,
    //     uint256 blockNumber,
    //     bytes memory /* params */
    // )
    //     internal
    //     view
    //     override(HuntGovernorVotes, HuntGovernorQuorum)
    //     returns (uint256)
    // {
    //     return _getPastVotes(
    //         account,
    //         blockNumber
    //     );
    // }

    function _getVotes(
        address account,
        bytes memory /* params */
    )
        internal
        view
        returns (uint256)
    {
        return _getVotingUnits(account);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
