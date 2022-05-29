// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import './common/PausableFinalizable.sol';
import './interfaces/IDefenseVault.sol';

/**
  * @title DefenseVault
  * @author HunterDAO
  * @notice Credit: Giveth developers for ICollector.sol
  * @notice A simple conditional escrow contract w/ DeFi yield farming that allows 
  *         the beneficiary to withdraw collected ETH and ERC-20 tokens.
  */
contract DefenseVault is IDefenseVault, AccessControlEnumerable, PausableFinalizable {

    error NoAddressZero();

    bytes32 private constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 private constant CAMPAIGN = keccak256("CAMPAIGN_ROLE");
    bytes32 private constant BENEFICIARY = keccak256("BENEFICIARY_ROLE");

    uint256 private constant crowdfundFee = 60;
    address payable private daoTreasury;

	modifier itself() {
		require(_msgSender() == address(this), "Caller is not contract itself");
		_;
	}

    constructor(address payable _beneficiaryAddr, address payable _daoTreasury) {
        daoTreasury = _daoTreasury;
        grantRole(CAMPAIGN, _msgSender());
        grantRole(DEFAULT, _beneficiaryAddr);
        _setupRole(BENEFICIARY, _beneficiaryAddr);
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

    function retireVault() external whenNotPaused whenActive {
        _finalize();
    }

    function withdraw() external whenNotPaused whenActive override {
        _checkRole(BENEFICIARY);
        address beneficiary = getRoleMember(BENEFICIARY, 0);
        emit Withdrawn(_msgSender(), address(this).balance);
        Address.sendValue(payable(beneficiary), address(this).balance);
    }

    function withdrawTokens(address token) external whenNotPaused whenActive override {
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

    function addBeneficiary(address newBeneficiary) external whenNotPaused whenActive override {
        require(hasRole(DEFAULT, _msgSender()) || hasRole(DEFAULT, _msgSender()), "Must be beneficiary or admin!");
        if (newBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        grantRole(BENEFICIARY, newBeneficiary);
    }

    function removeBeneficiary(address oldBeneficiary) external whenNotPaused whenActive override {
        require(hasRole(DEFAULT, _msgSender()) || hasRole(DEFAULT, _msgSender()), "Must be beneficiary or admin!");
        if (oldBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        revokeRole(BENEFICIARY, oldBeneficiary);
    }

    function replaceBeneficiary(address newBeneficiary, address oldBeneficiary) external whenNotPaused whenActive override {
        require(hasRole(DEFAULT, _msgSender()) || hasRole(DEFAULT, _msgSender()), "Must be beneficiary or admin!");
        if (oldBeneficiary == address(0) || newBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        revokeRole(BENEFICIARY, oldBeneficiary);
        grantRole(BENEFICIARY, newBeneficiary);
    }

    function getBalance() external view returns (uint) {
        _checkRole(BENEFICIARY);
        return address(this).balance;
    }

    function _imposeFee() internal whenPaused whenActive itself {
        address defenseVault = address(this);
        uint256 feeValue = defenseVault.balance * uint256(crowdfundFee);
        payable(daoTreasury).transfer(feeValue);
    }
}