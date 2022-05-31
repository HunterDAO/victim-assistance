// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./HuntCrowdfunding.sol";
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract HuntCrowdfundingFactory is PausableUpgradeable, AccessControlUpgradeable {

    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;

    string public constant title = "HuntCrowdfudingFactory";

    bytes32 public constant DEPLOYER = keccak256("DEPLOYER");
    bytes32 public constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");

    address payable daoTreasury;

    CountersUpgradeable.Counter private numDeployed;

    function __HuntCrowdfundingFactory_init(
        address _roleAdmin,
        address _daoExecutorAddress,
        address payable _daoTreasury
    ) external initializer {
        __HuntCrowdfundingFactory_init_unchained(
            _roleAdmin,
            _daoExecutorAddress,
            _daoTreasury
        );
    }

    function __HuntCrowdfundingFactory_init_unchained(
        address _roleAdmin,
        address _daoExecutorAddress,
        address payable _daoTreasury
    ) internal onlyInitializing {
        __Pausable_init();
        __AccessControl_init();

        daoTreasury = _daoTreasury;
        grantRole(DEFAULT, _roleAdmin);
        grantRole(DEPLOYER, _msgSender());
        grantRole(DEPLOYER, _daoExecutorAddress);
    }

    constructor() {}

    function deployNewCampaign(
        uint256 _maximumFunding,
        address payable _beneficiary
    ) public returns (address) {
        _checkRole(DEPLOYER);
        HuntCrowdfunding huntCrowdfunding = new HuntCrowdfunding();
        huntCrowdfunding.initialize(
            _maximumFunding,
            _beneficiary,
            daoTreasury
        );
        numDeployed.increment();
        return address(huntCrowdfunding);
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