// SPDX-License-Identifier: Apache
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetFixedSupplyUpgradeable.sol";

//IERC20MetadataUpgradeable
contract HuntToken is ERC20PresetFixedSupplyUpgradeable, ERC20VotesUpgradeable {

    uint256 private _numVoters = 0;
    mapping(uint256 => uint256) private _pastNumVoters;

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _initialSupply,
        address _owner
    ) initializer {
        initialize(
            _name,
            _symbol,
            _initialSupply,
            _owner
        );
        __ERC20Votes_init();
    }

    function getNumVoters() public view returns (uint256) {
        return _numVoters;
    }

    function getPastNumVoters(uint256 fromBlock) public view returns (uint256) {
        return _pastNumVoters[fromBlock];
    }

    function _mint(address account, uint256 amount) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        super._mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        if (balanceOf(account) - amount == 0) {
            _numVoters -= 1;
        }
        super._burn(account, amount);
    }

    /**
     * @dev Move voting power when tokens are transferred.
     * @dev Update numVoters as appropriate.
     *
     * Emits a {DelegateVotesChanged} event.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        _pastNumVoters[block.number] = _numVoters;

        if ((balanceOf(from) - amount) == 0) {
            _numVoters -= 1;
        } else if (balanceOf(to) == 0) {
            _numVoters += 1;
        }

        super._afterTokenTransfer(from, to, amount);
    }

    // /**
    //  * @dev Override sets .
    //  *
    //  * Emits events {DelegateChanged} and {DelegateVotesChanged}.
    //  */
    // function _delegate(address delegator, address delegatee) internal override {
    //     address currentDelegate = delegates(delegator);
    //     _delegates[delegator] = delegatee;

    //     emit DelegateChanged(delegator, currentDelegate, delegatee);

    //     _moveVotingPower(currentDelegate, delegatee, 1);
    // }

    // function _writeCheckpoint(
    //     Checkpoint[] storage ckpts
    //     // function(uint256, uint256) view returns (uint256) op,
    //     // uint256 delta
    // ) private override returns (uint256 oldWeight, uint256 newWeight) {
    //     uint256 pos = ckpts.length;
    //     oldWeight = pos == 0 ? 0 : ckpts[pos - 1].votes;
    //     newWeight = 1;
    //     // op(oldWeight, delta);

    //     if (pos > 0 && ckpts[pos - 1].fromBlock == block.number) {
    //         ckpts[pos - 1].votes = SafeCastUpgradeable.toUint224(newWeight);
    //     } else {
    //         ckpts.push(Checkpoint({fromBlock: SafeCastUpgradeable.toUint32(block.number), votes: SafeCastUpgradeable.toUint224(newWeight)}));
    //     }
    // }

}