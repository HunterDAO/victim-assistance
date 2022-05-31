// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import './interfaces/IHuntVault.sol';
import './governance/HuntRegistry.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol';

/**
  * @title VictimAsssistanceVault
  * @author HunterDAO
  * @notice Credit: Giveth developers for ICollector.sol
  * @notice A simple conditional escrow contract w/ DeFi yield farming that allows 
  *         the beneficiary to withdraw collected ETH and ERC-20 tokens.
  */
contract VictimAssistanceVault is IHuntVault, AccessControlEnumerableUpgradeable, PausableUpgradeable {

    using AddressUpgradeable for address;

    bytes32 private constant CAMPAIGN_ROLE = keccak256("CAMPAIGN_ROLE_ROLE");
    bytes32 private constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE_ROLE");

    uint256 private constant crowdfundFee = 60;
    HuntRegistry private registry;

    error NoAddressZero();

    event Contribution(address donor, uint256 amount);
    event Withdrawl(address beneficiary, uint256 amount);
    event WithdrawlTokens(SafeERC20 token, address beneficiary, uint256 amount);

    function initialize(
        address payable _beneficiary,
        address payable _campaign,
        address payable _registry
    ) public initializer  {
        __VictimAssistanceVault_init_unchained(
            _beneficiary,
            _campaign,
            _registry
        );
    }

    function __VictimAssistanceVault_init_unchained(
        address payable _beneficiary,
        address payable _campaign,
        address payable _registry
    ) internal onlyInitializing {
        registry.treasury() = _registry.treasury();
        _grantRole(CAMPAIGN_ROLE, _msgSender());
        _grantRole(BENEFICIARY_ROLE, _beneficiary);
        _pause();
    }

    constructor() {
        disableInitializers();
    }
    
    receive() external payable {
        emit Contribution(_msgSender(), msg.value);
    }

    function unlockFunds() external whenPaused onlyRole(CAMPAIGN_ROLE) {
        _imposeFee();
        _unpause();
    }

    function retireVault() external whenNotPaused onlyRole(CAMPAIGN_ROLE) {
        _pause();
    }

    function withdraw() external whenNotPaused override onlyRole(BENEFICIARY_ROLE) {
        Address.sendValue(payable(beneficiary), address(this).balance);
        emit Withdrawl(_msgSender(), address(this).balance);
    }

    function withdrawTokens(
        SafeERC20 token
    ) 
        external
        whenNotPaused
        override
        onlyRole(BENEFICIARY_ROLE)
    {
        uint256 balance = token.balanceOf(address(this));
        emit WithdrawlTokens(token, _msgSender(), balance);
        SafeERC20.safeTransfer(IERC20(token), beneficiary, balance);
    }

    function beneficiaryAdmin() external view override returns (address) {
        return getRoleMember(BENEFICIARY_ROLE, 0);
    }

    function numBeneficiaries() external view override returns (uint256) {
        return getRoleMemberCount(BENEFICIARY_ROLE);
    }

    function addBeneficiary(
        address newBeneficiary
    ) 
        public
        whenNotPaused
        override
    {
        require(hasRole(BENEFICIARY_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "Must be beneficiary or admin!");
        if (newBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        grantRole(BENEFICIARY_ROLE, newBeneficiary);
    }

    function removeBeneficiary(
        address oldBeneficiary
    ) 
        public
        whenNotPaused
        override
    {
        require(hasRole(BENEFICIARY_ROLE, _msgSender()) || hasRole(EXECUTOR_ROLE, _msgSender()), "Must be beneficiary or admin!");
        if (oldBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        revokeRole(BENEFICIARY_ROLE, oldBeneficiary);
    }

    function replaceBeneficiary(
        address newBeneficiary,
        address oldBeneficiary
    ) 
        public
        whenNotPaused
        override
    {
        addBeneficiary(newBeneficiary);
        removeBeneficiary(oldBeneficiary);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function _imposeFee() internal whenNotPaused {
        address defenseVault = address(this);
        uint256 feeValue = defenseVault.balance * uint256(crowdfundFee);
        payable(registry.treasury()).transfer(feeValue);
    }
}