// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import "./VictimAssistanceVault.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VictimAssistanceFactory is Pausable, AccessControl {
    
    // string public constant title = "HunterDAO - VictimAssistanceFactory";

    address public governor;
    
    constructor(address _governor) {
        governor = _governor;
        grantRole(0x00, _governor);
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary,
        uint256 _fee
    ) 
        public
    {   
        HuntCrowdfunding campaign = new HuntCrowdfunding(
            _maximumFunding,
            _beneficiary
        );

        new VictimAssistanceVault(
            _beneficiary,
            payable(campaign),
            governor,
            _fee

        );  
    }

    function pause() public onlyRole(0x00) {
        _pause();
    }

    function unpause() public onlyRole(0x00) {
        _unpause();
    }
}