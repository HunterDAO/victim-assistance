// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

// import "./TimeLock.sol";

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract HuntRegistry is AccessControlUpgradeable {

    using AddressUpgradeable for address;

    bytes32 private VICTIM_ASSISTANCE_ROLE = keccak256("VICTIM_ASSISTANCE_ROLE");

    struct VictimAssistance {
        address campaign;
        address vault;
        address payable _paymentSplitter;
    }

    address public hunt;
    uint256 public tokensToVote;

    address public donorRewards;

	address public governor;
	address payable public treasury;
	address public secOps;
	address public victimAssistanceFactory;

    VictimAssistance[] private victimAssistance;

	// address public router;
	// address public distributor;

	event HuntToken(address huntToken);
    event TokensToVoteChanged(uint256 tokens);

	event DonorRewardsNFTChanged(address donorRewards);

	event GovernorChanged(address governor);
	event SecOpsChanged(address secOps);
	event TreasuryChanged(address treasury);
	event VictimAssistanceFactoryChanged(address victimAssistanceFactory);

    event VictimAssistanceDeployed(address campaign, address vault, address payable paymentSplitter, uint256 victimAssistanceId);

    // event DonorRegistered(address donor, uint256 donation, uint256 victimAssistanceId);

    // event RouterChanged(address router);
	// event DistributorChanged(address distributor);

    function initialize(
        address _hunt,
        address _donorRewards,
        uint256 _tokensToVote,
        address _secOps,
        address payable _treasury,
	    address _victimAssistanceFactory
    )
        public
        initializer
    {
        __HuntRegistry_init_unchained(
            _hunt,
            _donorRewards,
            _tokensToVote,
            _secOps,
            _treasury,
            _victimAssistanceFactory
        );
    }

    function __HuntRegistry_init_unchained(
        address _hunt,
        address _donorRewards,
        uint256 _tokensToVote,
        address _secOps,
        address payable _treasury,
	    address _victimAssistanceFactory
    ) 
        internal
        onlyInitializing
    {
        hunt = _hunt;
        donorRewards = _donorRewards;
        tokensToVote = _tokensToVote;
        secOps = _secOps;
        governor = _msgSender();
        treasury = _treasury;
	    victimAssistanceFactory = _victimAssistanceFactory;
    }

	constructor() {
        _disableInitializers();    
    }

    // onlyGovernor
	function setTokensToVote(uint256 _tokensToVote) external {
		tokensToVote = _tokensToVote;
		emit TokensToVoteChanged(_tokensToVote);
	}

    // onlyGovernor
	function setDonorRewards(address _donorRewards) external {
		donorRewards = _donorRewards;
		emit DonorRewardsNFTChanged(_donorRewards);
	}

    // onlyGovernor
	function setGovernor(address _governor) external {
		governor = _governor;
		emit GovernorChanged(_governor);
	}

    // onlyGovernor
	function setTreasury(address payable _treasury) external {
		treasury = _treasury;
		emit TreasuryChanged(_treasury);
	}
    
    // onlyGovernor
	function setSecOps(address _secOps) external {
		secOps = _secOps;
		emit SecOpsChanged(_secOps);
	}

    // onlyGovernor
	function setVictimAssistanceFactory(address _victimAssistanceFactory) external {
		victimAssistanceFactory = _victimAssistanceFactory;
		emit VictimAssistanceFactoryChanged(_victimAssistanceFactory);
	}

	function registerVAC(
        address _campaign,
        address _vault,
        address payable _paymentSplitter
    ) 
        external
        onlyRole(VICTIM_ASSISTANCE_ROLE)
        returns (uint256)
    {
        victimAssistance.push(
            VictimAssistance(_campaign, _vault, _paymentSplitter)
        );
        uint256 victimAssistanceId = victimAssistance.length - 1;

		emit VictimAssistanceDeployed(_campaign, _vault, _paymentSplitter, victimAssistanceId);

        return victimAssistanceId;
	}

    // onlyGovernor
	// function setFeeRegistry(address _registry) external {
	// 	feeRegistry = _registry;
	// 	emit FeeRegistryChanged(_registry);
	// }

    // onlyGovernor
	// function setRouter(address _router) external {
		// router = _router;
		// emit RouterChanged(_router);
	// }

    // onlyGovernor
	// function setDistributor(address _distributor) external {
		// distributor = _distributor;
		// emit DistributorChanged(_distributor);
	// }

}