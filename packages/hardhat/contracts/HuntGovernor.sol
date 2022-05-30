// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "./governance/HuntGovernorVotes.sol";
import "./governance/HuntGovernorQuorum.sol";
import "./tokens/DonorRewardsNFT.sol";
import "./HuntCrowdfundingFactory.sol";
import "./common/registries/HCRegistry.sol";
import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:security-contact admin@hunterdao.io
contract HunterGovernor is Initializable, GovernorUpgradeable, GovernorSettingsUpgradeable, GovernorCountingSimpleUpgradeable, HuntGovernorVotes, HuntGovernorQuorum, GovernorTimelockControlUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    using AddressUpgradeable for address;

    HuntCrowdfundingFactory private huntCrowdfundingFactory;

    enum ProposalTypes { VictimAssistance }

    struct VictimAssistanceProposal {
        TimersUpgradeable.BlockNumber voteStart;
        TimersUpgradeable.BlockNumber voteEnd;
        address payable victim;
        address payable beneficiary;
        uint256 maximumFunding;
        bool executed;
        bool canceled;
    }

    HuntToken private hunt;
    HCRegistry private hcRegistry;
    DonorRewardsNFT private donorRewards;
    address payable huntTreasury;

    mapping(uint256 => VictimAssistanceProposal) private _victimAssistanceProposals;

    event NewVictimAssistance(uint256 proposalId, address victim, address beneficiary, address victimAssistance);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _roleAdmin,
        HuntToken _hunt,
        uint256 _nHuntTokens,
        DonorRewardsNFT _donorRewards,
        address payable _huntTreasury,
        TimelockControllerUpgradeable _timelock
    ) initializer public {
        __HuntGovernor_init(_roleAdmin, _hunt, _huntTreasury);
        __GovernorSettings_init(6570 /* blocks */, 19636 /* days */, 5);
        __GovernorCountingSimple_init();
        __HuntGovernorVotes_init(_nHuntTokens, _hunt, _donorRewards);
        __HuntGovernorQuorum_init(15, _hunt.getNumVoters(), _hunt);
        __GovernorTimelockControl_init(_timelock);
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function __HuntGovernor_init(address _roleAdmin, HuntToken _hunt,  address payable _huntTreasury) internal onlyInitializing {
        __HuntGovernor_init_unchained(_roleAdmin, _hunt, _huntTreasury);
    }

    function __HuntGovernor_init_unchained(
        address _roleAdmin,
        HuntToken _hunt,
        address payable _huntTreasury
    ) internal onlyInitializing {
        hunt = _hunt;
        // hcRegistry = new HCRegistry();
        huntTreasury = _huntTreasury;
        huntCrowdfundingFactory = new HuntCrowdfundingFactory(
            _roleAdmin,
            address(this),
            _huntTreasury
        );
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    function votingDelay() public view override(IGovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(
        uint256 blockNumber
    ) public view override(IGovernorUpgradeable, HuntGovernorQuorum) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function state(
        uint256 proposalId
    ) public view override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (ProposalState) {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(GovernorUpgradeable, IGovernorUpgradeable) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold() public view override(GovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.proposalThreshold();
    }

    function _voteSucceeded(
        uint8 proposalType,
        uint256 proposalId
    ) internal view returns (bool) {
        if (ProposalTypes(proposalType) == ProposalTypes.VictimAssistance) {
            return _victimAssistanceProposals[proposalId].executed;
        } else {
            ProposalState _state = state(proposalId);
            return _state == ProposalState.Executed || _state == ProposalState.Succeeded;
        }
    }

    function _getVotes(
        address account,
        uint256 blockNumber,
        bytes memory params
    ) internal view override(GovernorUpgradeable, HuntGovernorVotes, GovernorVotesUpgradeable) returns (uint256) {
        return _getVotingUnits(account);   
    }

    function _execute(
        uint256 _proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) {
        ProposalTypes proposalType = abi.decode(calldatas[0], (ProposalTypes));
        if (ProposalTypes(proposalType) == ProposalTypes.VictimAssistance) {
            VictimAssistanceProposal storage proposal = _victimAssistanceProposals[_proposalId];
            // 
            address newVictimAssistance = address(huntCrowdfundingFactory.deployNewCampaign(
                proposal.maximumFunding,
                proposal.beneficiary
            ));

            hcRegistry.registerHC(payable(newVictimAssistance));
            
            emit NewVictimAssistance(_proposalId, proposal.victim, proposal.beneficiary, newVictimAssistance);
        } else {
            super._execute(_proposalId, targets, values, calldatas, descriptionHash);
        }
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
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