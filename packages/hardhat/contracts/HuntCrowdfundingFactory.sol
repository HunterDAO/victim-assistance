// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import '@openzeppelin/contracts/utils/Address.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HuntCrowdfundingFactory is Pausable, AccessControl {

    using Address for address;
    using Counters for Counters.Counter;

    string public constant title = "HuntCrowdfudingFactory";

    bytes32 public constant DEPLOYER = keccak256("DEPLOYER");
    bytes32 public constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");

    address payable daoTreasury;

    Counters.Counter private numDeployed;

    constructor(
        address _roleAdmin,
        address _daoExecutorAddress,
        address payable _daoTreasury
    ) {
        daoTreasury = _daoTreasury;
        _grantRole(DEFAULT, _roleAdmin);
        _grantRole(DEPLOYER, _daoExecutorAddress);
    }

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary
    ) public returns (address) {
        _checkRole(DEPLOYER);
        address agreementAddr = address(new HuntCrowdfunding(
            _maximumFunding,
            _beneficiary,
            daoTreasury
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