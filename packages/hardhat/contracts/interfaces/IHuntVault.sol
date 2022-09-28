// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/**
  * @title IDefenseVault
  * @author HunterDAO
  * @notice Credit: Giveth developers for ICollector.sol
  * @notice Interface of the DefenseVault contract.
  */
interface IHuntVault {

    /**
      * @notice Withdraw all the collected ETH.
      * @dev Can only be called by the beneficiary.
      */
    function withdraw() external;

    /**
      * @notice Withdraw all the collected tokens from the given token contract.
      * @dev Can only be called by the beneficiary. Token must be a valid ERC20 contract.
      * @param token Token contract address.
      */
    function withdrawToken(IERC20 token, uint256 value) external;

    /**
      * @notice Emitted when a deposit is received
      */
    event Deposit(address account, uint256 amount);

    /**
      * @notice Emitted when the beneficiary is changed by the owner.
      */
    event BeneficiaryChanged(address beneficiary, address sender);

    /**
      * @notice Emitted when the collected ETH was withdrawn.
      */
    event Withdrawl(address beneficiary, uint256 amount);

    /**
      * @notice Emitted when the collected tokens were withdrawn.
      */
    event WithdrawlToken(address indexed token, address beneficiary, uint256 amount);
}