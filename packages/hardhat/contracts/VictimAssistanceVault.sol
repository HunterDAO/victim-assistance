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
    bytes32 private constant SPENDER_ROLE = keccak256("SPENDER_ROLE_ROLE");

    uint256 private constant crowdfundFee = 60;

    HuntRegistry private registry;

    address payable beneficiary;

    error NoAddressZero();

    function initialize(
        address payable _beneficiary,
        address payable _campaign,
        HuntRegistry _registry
    ) external initializer  {
        __VictimAssistanceVault_init(
            _beneficiary,
            _campaign,
            _registry
        );
    }

    function __VictimAssistanceVault_init(
        address payable _beneficiary,
        address payable _campaign,
        HuntRegistry _registry
    ) internal onlyInitializing {
        registry = _registry;
        _grantRole(CAMPAIGN_ROLE, _msgSender());
        _grantRole(SPENDER_ROLE, _beneficiary);
        _grantRole(DEFAULT_ADMIN_ROLE, _registry.secOps());
        _pause();
    }

    constructor() {
        _disableInitializers();
    }
    
    receive() external payable {
        emit Deposit(_msgSender(), msg.value);
    }

    function unlockFunds() external whenPaused onlyRole(CAMPAIGN_ROLE) {
        _imposeFee();
        _unpause();
    }

    function retireVault() external whenNotPaused onlyRole(CAMPAIGN_ROLE) {
        _pause();
    }

    function withdraw() external whenNotPaused override onlyRole(SPENDER_ROLE) {
        Address.sendValue(payable(beneficiary), address(this).balance);
        emit Withdrawl(_msgSender(), address(this).balance);
    }

    function withdrawTokens(
        IERC20 token
    ) 
        external
        whenNotPaused
        onlyRole(SPENDER_ROLE)
        override
    {
        uint256 balance = token.balanceOf(address(this));
        emit WithdrawlTokens(address(token), _msgSender(), balance);
        SafeERC20.safeTransfer(IERC20(token), beneficiary, balance);
    }

    function numSpenders() external view returns (uint256) {
        // return registry.numSpenders(address(this));
        return getRoleMemberCount(SPENDER_ROLE);
    }

    function addSpender(
        address newSpender
    ) 
        public
        whenNotPaused
    {
        require(hasRole(SPENDER_ROLE, _msgSender()) || hasRole(0x00, _msgSender()), "Must be approved spender or admin!");
        grantRole(SPENDER_ROLE, newSpender);
    }

    function removeSpender(
        address oldSpender
    ) 
        public
        whenNotPaused
    {
        require(hasRole(SPENDER_ROLE, _msgSender()) || hasRole(0x00, _msgSender()), "Must be beneficiary or admin!");
        revokeRole(SPENDER_ROLE, oldSpender);
    }

    function replaceSpender(
        address newSpender,
        address oldSpender
    ) 
        public
        whenNotPaused
    {
        addSpender(newSpender);
        removeSpender(oldSpender);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function _imposeFee() internal whenNotPaused {
        uint256 feeValue = address(this).balance * uint256(crowdfundFee);

        registry.treasury().transfer(feeValue);
    }
}