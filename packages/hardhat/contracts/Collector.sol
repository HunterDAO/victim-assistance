// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import './interfaces/ICollector.sol';

/// Must not be address zero;
error NoAddressZero();

/// @title Collector
/// @author Giveth developers
/// @notice A simple collection contract that allows the beneficiary to withdraw collected ETH and ERC-20 tokens.
contract Collector is ICollector, AccessControlEnumerable {

    bytes32 public constant DEFAULT = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 public constant BENEFICIARY = keccak256("BENEFICIARY_ROLE");

    constructor(address payable beneficiaryAddr) {
        grantRole(DEFAULT, _msgSender());
        _setupRole(BENEFICIARY, beneficiaryAddr);
    }

    receive() external payable {
        emit Collected(_msgSender(), msg.value);
    }

    function changeBeneficiary(address newBeneficiary) external override {
        require(hasRole(DEFAULT, _msgSender()) || hasRole(BENEFICIARY, _msgSender()), "Must be beneficiary or admin!");
        if (newBeneficiary == address(0)) {
            revert NoAddressZero();
        }
        address prevBeneficiary = getRoleMember(BENEFICIARY, 0);
        revokeRole(BENEFICIARY, prevBeneficiary);
        grantRole(BENEFICIARY, newBeneficiary);
    }

    function withdraw() external override {
        _checkRole(BENEFICIARY);
        address beneficiary = getRoleMember(BENEFICIARY, 0);
        emit Withdrawn(_msgSender(), address(this).balance);
        Address.sendValue(payable(beneficiary), address(this).balance);
    }

    function withdrawTokens(address token) external override {
        _checkRole(BENEFICIARY);
        address beneficiary = getRoleMember(BENEFICIARY, 0);
        uint256 balance = IERC20(token).balanceOf(address(this));
        emit WithdrawnTokens(token, _msgSender(), balance);
        SafeERC20.safeTransfer(IERC20(token), beneficiary, balance);
    }

    function beneficiary() external view override returns (address) {
        return getRoleMember(BENEFICIARY, 0);
    }

    function getBalance() public view returns (uint) {
        _checkRole(BENEFICIARY);
        return address(this).balance;
    }
}