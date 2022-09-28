// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./RevShareAgreement.sol";
import '@openzeppelin/contracts/utils/Address.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RevShareAgreementFactory is Pausable, AccessControl {

    using Address for address;
    using Counters for Counters.Counter;

    string public constant title = "RevShareAgreementFactory";

    bytes32 public constant DEPLOYER = keccak256("DEPLOYER_ROLE");
    bytes32 public constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");

    Counters.Counter private numDeployed;

    constructor(
        address _roleAdmin,
        address _daoExecutorAddress
    ) {
        _setupRole(DEFAULT, _roleAdmin);
        _setupRole(DEPLOYER, _daoExecutorAddress);
    }

    function deployNewRevShare(
        string memory _projectName,
        uint256 _orgFee,
        uint256 _totalContributed,
        address payable _orgAddress,
        address payable _beneficiary,
        address _adminAddress,
        bool _releaseOnTransfer
    ) public returns (address) {
        _checkRole(DEPLOYER);
        address agreementAddr = address(new RevShareAgreement(
            _projectName,
            _orgFee,
            _totalContributed,
            _orgAddress,
            _beneficiary,
            _adminAddress,
            _releaseOnTransfer
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