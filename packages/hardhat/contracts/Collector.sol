// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import './interfaces/ICollector.sol';

/// Must be called by the beneficiary address
error OnlyBeneficiary();

/// Must not be address zero;
error NoAddressZero();

/// @title Collector
/// @author Giveth developers
/// @notice A simple collection contract that allows the beneficiary to withdraw collected ETH and ERC-20 tokens.
contract Collector is ICollector, Ownable {

    address internal _beneficiary;

    modifier onlyBeneficiary() {
        if (_msgSender() != _beneficiary) {
            revert OnlyBeneficiary();
        }
        _;
    }

    constructor(address payable beneficiaryAddr) {
        _beneficiary = beneficiaryAddr;
    }

    receive() external payable {
        emit Collected(_msgSender(), msg.value);
    }

    function changeBeneficiary(address beneficiaryAddr) external override onlyOwner {
        if (beneficiaryAddr == address(0)) {
            revert NoAddressZero();
        }
        _beneficiary = beneficiaryAddr;
    }

    function withdraw() external override onlyBeneficiary {
        emit Withdrawn(_msgSender(), address(this).balance);
        Address.sendValue(payable(_beneficiary), address(this).balance);
    }

    function withdrawTokens(address token) external override onlyBeneficiary {
        uint256 balance = IERC20(token).balanceOf(address(this));
        emit WithdrawnTokens(token, _msgSender(), balance);
        SafeERC20.safeTransfer(IERC20(token), _beneficiary, balance);
    }

    function beneficiary() external view override returns (address) {
        return _beneficiary;
    }

    function getBalance() public view onlyBeneficiary returns (uint) {
        return address(this).balance;
    }
}