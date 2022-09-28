// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import './interfaces/IHuntVault.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

/**
  * @title VictimAsssistanceVault
  * @author HunterDAO
  * @notice Credit: Giveth developers for ICollector.sol
  * @notice A simple conditional escrow contract w/ DeFi yield farming that allows 
  *         the beneficiary to withdraw collected ETH and ERC-20 tokens.
  */
contract VictimAssistanceVault is IHuntVault, AccessControlEnumerable, Pausable {

    bytes32 private constant CAMPAIGN_ROLE = keccak256("CAMPAIGN_ROLE_ROLE");
    bytes32 private constant SPENDER_ROLE = keccak256("SPENDER_ROLE_ROLE");

    uint256 private fee;

    bool private _canSpend = false;

    address payable beneficiary;

    constructor(
        address payable _beneficiary, // Service provider address
        address payable _campaign, // Campaign contract address
        address _governor, // Governor contract address
        uint256 _fee // DAO referal fee
    )  {
        fee = _fee;
        _grantRole(CAMPAIGN_ROLE, _campaign);
        _grantRole(SPENDER_ROLE, _beneficiary);
        _grantRole(DEFAULT_ADMIN_ROLE, _governor);
    }

    modifier spenderOrAdmin() {
        require(
            hasRole(SPENDER_ROLE, _msgSender()) || hasRole(0x00, _msgSender()),
            "Must be beneficiary or admin!"
        );
        _;
    }

    receive() external payable {
        if (paused()) {
            revert("#receive: Cannot deposit funds into locked vault.");
        } else {
            emit Deposit(_msgSender(), msg.value);
        }
    }

    function addSpender(
        address newSpender
    ) 
        public
        whenNotPaused
        spenderOrAdmin
    {
        grantRole(SPENDER_ROLE, newSpender);
    }

    function removeSpender(
        address oldSpender
    ) 
        public
        whenNotPaused
        spenderOrAdmin
    {
        revokeRole(SPENDER_ROLE, oldSpender);
    }

    function replaceSpender(
        address newSpender,
        address oldSpender
    ) 
        external
        whenNotPaused
        spenderOrAdmin
    {
        addSpender(newSpender);
        removeSpender(oldSpender);
    }

    function retireVault() external whenNotPaused onlyRole(CAMPAIGN_ROLE) {
        _pause();
        _imposeFee();
        _canSpend = true;
    }

    function withdraw() external whenNotPaused override onlyRole(SPENDER_ROLE) {
        require(_canSpend = true, "#withdraw: Funds locked until campaign has completed successfully.");
        Address.sendValue(payable(beneficiary), address(this).balance);
        emit Withdrawl(_msgSender(), address(this).balance);
    }

    function withdrawToken(
        IERC20 token, 
        uint256 value
    ) 
        external
        override
        whenNotPaused
        onlyRole(SPENDER_ROLE)
    {
        require(
            _canSpend = true,
            "#withdraw: Funds locked until campaign has completed successfully."
        );
        require(
            value > 0 && value < token.balanceOf(address(this)),
            "#withdraw: Value error."
        );
        SafeERC20.safeTransfer(IERC20(token), beneficiary, value);
        emit WithdrawlTokens(address(token), _msgSender(), value);
    }

    function numSpenders() external view returns (uint256) {
        return getRoleMemberCount(SPENDER_ROLE);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(IERC20 token) external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function _imposeFee() internal whenNotPaused {
        uint256 feeValue = address(this).balance * uint256(fee);
        beneficiary.transfer(feeValue);
    }

    function _imposeTokenFee(IERC20 token) internal whenNotPaused {
        uint256 feeValue = token.balanceOf(address(this)) * uint256(fee);
        token.transfer(beneficiary, feeValue);
    }
}