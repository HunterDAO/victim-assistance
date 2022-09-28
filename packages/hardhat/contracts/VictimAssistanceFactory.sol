// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import "./VictimAssistanceVault.sol";
import "./governance/HuntRegistry.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

contract VictimAssistanceFactory is Pausable {
    
    // using Address for address;

    string public constant title = "HunterDAO - VictimAssistanceFactory";

    // bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    // bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    HuntRegistry private registry;

    address private opSec;

    modifier onlyOpSec() {
        require(_msgSender() == opSec);
        _;
    }

    constructor(
        HuntRegistry _registry
    ) {
        // grantRole(EXECUTOR_ROLE, _msgSender());
        // grantRole(PAUSER_ROLE, _registry.opSec());

        registry = _registry;
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary
    ) 
        public
        // onlyOwner
        // onlyRole(EXECUTOR_ROLE)
    {
        // address payable treasury = registry.treasury();
        
        HuntCrowdfunding campaign = new HuntCrowdfunding(
            _maximumFunding,
            _beneficiary,
            registry
        );

        VictimAssistanceVault vault = new VictimAssistanceVault(
            _beneficiary,
            payable(campaign),
            registry
        );
        
        registry.registerVAC(address(campaign), address(vault));
    }

    function pause() public onlyOpSec {
        // require(hasRole(PAUSER_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistanceFactory: unauthorized");
        _pause();
    }

    function unpause() public onlyOpSec {
        // require(hasRole(PAUSER_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "VictimAssistanceFactory: unauthorized");
        _unpause();
    }
}