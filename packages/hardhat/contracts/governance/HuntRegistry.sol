// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.2;

// import "./TimeLock.sol";

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract HuntRegistry is AccessControlUpgradeable {

    using AddressUpgradeable for address;

    struct VictimAssistance {
        address campaign;
        address vault;
    }

	address public governor;
	address public treasury;
	address public secOps;
	address public feeRegistry;
	address public victimAssistanceFactory;

    VictimAssistance[] victimAssistance;

	// address public router;
	// address public distributor;

	event GovernorChanged(address governor);
	event SecOpsChanged(address secOps);
	event TreasuryChanged(address treasury);
	event FeeRegistryChanged(address feeRegistry);
	event VictimAssistanceFactoryChanged(address victimAssistanceFactory);
    event VictimAssistanceCampaignRegistered(address _campaign, address _vault);

    // event RouterChanged(address router);
	// event DistributorChanged(address distributor);

    function __HuntRegistry_init(
        address _secOps,
        address _treasury,
        address _feeRegistry,
	    address _victimAssistanceFactory
    ) 
        internal
        onlyInitializing
    {
        __HuntRegistry_init_unchained(
            _secOps,
            _treasury,
            _feeRegistry,
            _victimAssistanceFactory
        );
    }

    function __HuntRegistry_init_unchained(
        address _secOps,
        address _treasury,
        address _feeRegistry,
	    address _victimAssistanceFactory
    ) 
        internal
        onlyInitializing
    {
        secOps = _secOps;
        governor = _msgSender();
        treasury = _treasury;
        feeRegistry = _feeRegistry;
	    victimAssistanceFactory = _victimAssistanceFactory;
    }

	constructor() { }
    
    // onlyGovernor
	function setSecOps(address _secOps) external {
		secOps = _secOps;
		emit GovernorChanged(_secOps);
	}

    // onlyGovernor
	function setGovernor(address _governor) external {
		governor = _governor;
		emit GovernorChanged(_governor);
	}

    // onlyGovernor
	function setTreasury(address _treasury) external {
		treasury = _treasury;
		emit TreasuryChanged(_treasury);
	}

    // onlyGovernor
	function setFeeRegistry(address _registry) external {
		feeRegistry = _registry;
		emit FeeRegistryChanged(_registry);
	}

    // onlyGovernor
	function setVictimAssistanceFactory(address _victimAssistanceFactory) external {
		victimAssistanceFactory = _victimAssistanceFactory;
		emit VictimAssistanceFactoryChanged(_victimAssistanceFactory);
	}

    // onlyGovernor
	function registerVC(
        address _campaign,
        address _vault
    ) external {
        victimAssistance.push(
            VictimAssistance(_campaign, _vault)
        );
		emit VictimAssistanceDeployed(victimAssitance.length - 1, _campaign, _vault);
	}

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