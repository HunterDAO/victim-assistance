// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/utils/Address.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CrowdfundingCampaign.sol";

contract CrowdfundingCampaignFactory is Pausable, AccessControl {

    using Address for address;
    using Counters for Counters.Counter;

    string public constant title = "CrowdfudingCampaignFactory";

    bytes32 public constant DEPLOYER = keccak256("DEPLOYER");
    bytes32 public constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");

    Counters.Counter private numDeployed;

    constructor(
        address _roleAdmin,
        address _daoExecutorAddress
    ) {
        _setupRole(DEFAULT, _roleAdmin);
        _setupRole(DEPLOYER, _daoExecutorAddress);
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _serviceProvider
    ) public returns (address) {
        _checkRole(DEPLOYER);
        address agreementAddr = address(new CrowdfundingCampaign(
            _maximumFunding,
            _serviceProvider
        ));
        numDeployed.increment();
        return agreementAddr;
    }

    function getNumDeployed() public view returns (uint256) {
        return numDeployed.current();
    }

    function pause() public {
        _checkRole(DEFAULT);
        _pause();
    }

    function unpause() public {
        _checkRole(DEFAULT);
        _unpause();
    }
}