// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import "./VictimAssistanceVault.sol";
// import "./governance/HuntRegistry.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VictimAssistanceFactory is Pausable, AccessControl {
    
    // using Address for address;

    // string public constant title = "HunterDAO - VictimAssistanceFactory";

    // bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    // bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // HuntRegistry private registry;

    // address private opSec;

    address public governor;

    // modifier onlyOpSec() {
    //     require(_msgSender() == opSec);
    //     _;
    // }

    constructor(
        address _governor
        // HuntRegistry _registry
    ) {
        governor = _governor;
        // grantRole(EXECUTOR_ROLE, _msgSender());
        // grantRole(PAUSER_ROLE, _registry.opSec());

        // registry = _registry;
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary,
        uint256 _fee
    ) 
        public
    {
        // address payable treasury = registry.treasury();
        
        HuntCrowdfunding campaign = new HuntCrowdfunding(
            _maximumFunding,
            _beneficiary
            // registry
        );

        // VictimAssistanceVault vault = 
        new VictimAssistanceVault(
            _beneficiary,
            payable(campaign),
            governor,
            _fee

        );  
        
        // registry.registerVAC(address(campaign), address(vault));
    }

    function pause() public onlyRole(0x00) {
        _pause();
    }

    function unpause() public onlyRole(0x00) {
        _unpause();
    }
}