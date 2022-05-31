// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import "./VictimAssistanceVault.sol";
import "./governance/HuntRegistry.sol";
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract HuntCrowdfundingFactory is PausableUpgradeable, AccessControlUpgradeable {

    using AddressUpgradeable for address;

    string public constant title = "HunterDAO - VictimAssistanceFactory";

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    HuntRegistry registry;
    address payable treasury;

    event VictimAssistanceCampaignDeployed(uint256 vcRegistryId, address campaignAddress, address vaultAddress);

    function __VictimAssistanceFactory_init(
        HuntRegistry _huntRegistry
    )
        internal
        initializer
    {
        __VictimAssistanceFactory_init_unchained();
    }

    function __VictimAssistanceFactory_init_unchained(
        HuntRegistry _huntRegistry
    ) 
        internal
        onlyInitializing
    {
        grantRole(EXECUTOR_ROLE, _msgSender());
        grantRole(PAUSER_ROLE, _huntRegistry.secOps());

        registry = _huntRegistry;

        __Pausable_init();
        __AccessControl_init();
    }

    constructor() {}

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary
    ) 
        public
        // onlyGovernor
        onlyRole(EXECUTOR_ROLE)
    {
        HuntCrowdfunding huntCrowdfunding = new HuntCrowdfunding();
        campaign.initialize(
            _maximumFunding,
            _beneficiary,
            registry.treasury()
        );

        VictimAssistanceVault vault = new VictimAssistanceVault();
        campaign.initialize(
            _beneficiary,
            registry.treasury()
        );

        registry.registerVC(address(campaign), address(vault));
    }

    function pause() public {
        require(_hasRoleRole(PAUSER_ROLE, _msgSender()) || _hasRoleRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistaREQUIREDnceFactory: PAUSER_ROLE REQUIRED");
        _pause();
    }

    function unpause() public {
        require(_hasRoleRole(PAUSER_ROLE, _msgSender()) || _hasRoleRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistaREQUIREDnceFactory: PAUSER_ROLE REQUIRED");
        _unpause();
    }
}