// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import './interfaces/IHuntVault.sol';
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

    error NoAddressZero();

    bytes32 private constant CAMPAIGN = keccak256("CAMPAIGN_ROLE");
    bytes32 private constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 private constant BENEFICIARY = keccak256("BENEFICIARY_ROLE");

    uint256 private constant crowdfundFee = 60;
    address payable private daoTreasury;

    constructor(
        address payable _beneficiaryAddr,
        address payable _daoTreasury
    ) {
        daoTreasury = _daoTreasury;
        _grantRole(DEFAULT, _beneficiaryAddr);
        _grantRole(CAMPAIGN, _msgSender());
        _grantRole(BENEFICIARY, _beneficiaryAddr);
        _pause();
    }
    
    receive() external payable {
        emit Collected(_msgSender(), msg.value);
    }

    function unlockFunds() external whenPaused {
        _checkRole(CAMPAIGN);
        _imposeFee();
        _unpause();
    }

    function retireVault() external whenNotPaused {
        _pause();
    }

    function withdraw() external whenNotPaused override {
        _checkRole(BENEFICIARY);
        address beneficiary = getRoleMember(BENEFICIARY, 0);
        emit Withdrawn(_msgSender(), address(this).balance);
        Address.sendValue(payable(beneficiary), address(this).balance);
    }

    function withdrawTokens(
        address token
    ) 
        external
        whenNotPaused
        override
    {
        _checkRole(BENEFICIARY);
        address beneficiary = getRoleMember(BENEFICIARY, 0);
        uint256 balance = IERC20(token).balanceOf(address(this));
        emit WithdrawnTokens(token, _msgSender(), balance);
        SafeERC20.safeTransfer(IERC20(token), beneficiary, balance);
    }

    function beneficiaryAdmin() external view override returns (address) {
        return getRoleMember(DEFAULT, 0);
    }

    function numBeneficiaries() external view override returns (uint256) {
        return getRoleMemberCount(BENEFICIARY);
    }

    function addBeneficiary(
        address newBeneficiary
    ) 
        public
        whenNotPaused
        override
    {
        require(hasRole(BENEFICIARY, _msgSender()) || hasRole(DEFAULT, _msgSender()), "Must be beneficiary or admin!");
        if (newBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        grantRole(BENEFICIARY, newBeneficiary);
    }

    function removeBeneficiary(
        address oldBeneficiary
    ) 
        public
        whenNotPaused
        override
    {
        require(hasRole(BENEFICIARY, _msgSender()) || hasRole(DEFAULT, _msgSender()), "Must be beneficiary or admin!");
        if (oldBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        revokeRole(BENEFICIARY, oldBeneficiary);
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

    function getBalance() external view returns (uint) {
        _checkRole(BENEFICIARY);
        return address(this).balance;
    }

    function _imposeFee() internal whenNotPaused {
        address defenseVault = address(this);
        uint256 feeValue = defenseVault.balance * uint256(crowdfundFee);
        payable(daoTreasury).transfer(feeValue);
    }
}