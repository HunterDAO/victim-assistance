// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

/**
  * @title IDefenseVault
  * @author HunterDAO
  * @notice Credit: Giveth developers for ICollector.sol
  * @notice Interface of the DefenseVault contract.
  */
interface IHuntVault {

    /**
      * @notice Add an approved spender for beneficiary.
      * @dev Can only be called by the owner. Beneficiary cannot be address zero.
      * @param newBeneficiary The new approved spender.
      */
    function addBeneficiary(address newBeneficiary) external;

    /**
      * @notice remove an approved spender beneficiary.
      * @dev Can only be called by the owner. Beneficiary cannot be address zero.
      * @param oldBeneficiary The old approved spender.
      */
    function removeBeneficiary(address oldBeneficiary) external;

    /**
      * @notice Replace an approved spender beneficiary.
      * @dev Can only be called by the owner. Beneficiary cannot be address zero.
      * @param newBeneficiary The new approved spender.
      * @param oldBeneficiary The old approved spender.
      */
    function replaceBeneficiary(address newBeneficiary, address oldBeneficiary) external;

    /**
      * @notice Returns the beneficiary admin address.
      * @return Address of the beneficiary admin.
      */
    function beneficiaryAdmin() external view returns (address);

    /**
      * @notice Returns the number of beneficiary approved spenders.
      * @return Number of the beneficiary approved spenders.
      */
    function numBeneficiaries() external view returns (uint256);

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
    function withdrawTokens(address token) external;

    /**
      * @notice Emitted when the collector contract receives ETH.
      */
    event Collected(address sender, uint256 amount);

    /**
      * @notice Emitted when the beneficiary is changed by the owner.
      */
    event BeneficiaryChanged(address beneficiary, address sender);

    /**
      * @notice Emitted when the collected ETH was withdrawn.
      */
    event Withdrawn(address beneficiary, uint256 amount);

    /**
      * @notice Emitted when the collected tokens were withdrawn.
      */
    event WithdrawnTokens(address indexed token, address beneficiary, uint256 amount);
}