// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "hardhat/console.sol";
// import "./HuntRegistry.sol";
import "./HuntGovernorVotes.sol";
import "./HuntGovernorQuorum.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
// import "../VictimAssistanceFactory.sol";

/// @custom:security-contact admin@hunterdao.io
contract HuntGovernor is Governor, GovernorSettings, GovernorCountingSimple, HuntGovernorVotes, HuntGovernorQuorum, GovernorTimelockControl { 

    // VictimAssistanceFactory public victimAssistanceFactory;
    constructor(address _token, Governor, TimelockController _timelock)
    // , address _victimAssistanceFactory)
        Governor("HuntGovernor")
        GovernorSettings(1 /* 1 block | 19636 = 3 days */, 10 /* 1 week */, 1)
        HuntGovernorVotes(_token)
        HuntGovernorQuorum(4)
        GovernorTimelockControl(_timelock)
    {
        // victimAssistanceFactory = VictimAssistanceFactory(_victimAssistanceFactory);
    }

    // The following functions are overrides required by Solidity.

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, HuntGovernorQuorum)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public
        // (Governor, IGovernor)
        override(IGovernor, Governor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        pure
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return 1;
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function getVotes(
        address account,
        uint256 blockNumber,
        bytes memory /*params*/
    )
        public
        view
        // override(Governor, HuntGovernorVotes)
        returns (uint256)
    {
        return token.getPastVotes(account, blockNumber);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}