// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import "./VictimAssistanceVault.sol";
import "./governance/HuntRegistry.sol";
import "./governance/HuntPaymentSplitter.sol";
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract HuntCrowdfundingFactory is PausableUpgradeable, AccessControlUpgradeable {

    using AddressUpgradeable for address;

    string public constant title = "HunterDAO - VictimAssistanceFactory";

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    HuntRegistry private registry;

    function initialize(
        HuntRegistry _registry
    )
        external
        initializer
    {
        __VictimAssistanceFactory_init_unchained(_registry);
    }

    function __VictimAssistanceFactory_init_unchained(
        HuntRegistry _registry
    ) 
        internal
        onlyInitializing
    {
        grantRole(EXECUTOR_ROLE, _msgSender());
        grantRole(PAUSER_ROLE, _registry.secOps());

        registry = _registry;

        __Pausable_init();
        __AccessControl_init();
    }

    constructor() {
        _disableInitializers();
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary
    ) 
        public
        // onlyGovernor
        onlyRole(EXECUTOR_ROLE)
    {
        address payable treasury = registry.treasury();
        
        HuntCrowdfunding campaign = new HuntCrowdfunding();
        campaign.initialize(
            _maximumFunding,
            _beneficiary,
            registry
        );

        VictimAssistanceVault vault = new VictimAssistanceVault();
        vault.initialize(
            _beneficiary,
            payable(campaign),
            registry
        );

        PaymentSplitterUpgradeable paymentSplitter = new HuntPaymentSplitter();

        registry.registerVAC(address(campaign), address(vault), payable(paymentSplitter));
    }

    function pause() public {
        require(hasRole(PAUSER_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistaREQUIREDnceFactory: PAUSER_ROLE REQUIRED");
        _pause();
    }

    function unpause() public {
        require(hasRole(PAUSER_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistaREQUIREDnceFactory: PAUSER_ROLE REQUIRED");
        _unpause();
    }
}