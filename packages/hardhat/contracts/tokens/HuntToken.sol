// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CheckpointsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

/// @custom:security-contact admin@hunterdao.io
contract HuntToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, PausableUpgradeable, AccessControlUpgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using CheckpointsUpgradeable for CheckpointsUpgradeable.History;

    uint256 public voters = 0;
    CheckpointsUpgradeable.History internal votersCheckpoints;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC20_init("HuntToken", "HUNT");
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init("HuntToken");
        __ERC20Votes_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(
        address to,
        uint256 amount
    ) 
        public
        whenNotPaused
        onlyRole(MINTER_ROLE)
    {
        _mint(to, amount);
    }

    function getVoters() public view returns (uint256) {
        return voters;
    } 

    function getPastVoters(uint256 blockNumber) public view returns (uint256) {
        return votersCheckpoints.getAtBlock(blockNumber);
    } 

    function _mint(
        address to,
        uint256 amount
    )
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    )
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 amount
    )
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) 
        internal
        whenNotPaused
        override(ERC20Upgradeable, ERC20VotesUpgradeable) 
    {
        _updateVoters(from, to);
        super._afterTokenTransfer(from, to, amount);
    }

    function _updateVoters(
        address from,
        address to
    ) internal {
        if ((balanceOf(from) - 1) == 0) {
            votersCheckpoints.push(_subtraction, voters);
            voters -= 1;
        }
        if (balanceOf(to) == 0) {
            votersCheckpoints.push(_addition, voters);
            voters += 1;
        }
    }

    function _addition(
        uint256 a,
        uint256 b
    ) private pure returns (uint256) {
        return a + b;
    }

    function _subtraction(
        uint256 a,
        uint256 b
    ) private pure returns (uint256) {
        return a - b;
    }
}
