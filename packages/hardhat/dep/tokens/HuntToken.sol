// // SPDX-License-Identifier: Apache
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";

// contract HuntToken is ERC20Upgradeable, ERC20CappedUpgradeable, ERC20VotesUpgradeable {

//     uint256 _nTokens;

//     uint256 private _numVoters = 0;
//     mapping(uint256 => uint256) private _pastNumVoters;

//     // mapping(address => uint256) private _votingRights;
//     // mapping(address => Checkpoint[]) private _votingRightsCheckpoint;

//     function __HuntToken_init(
//         string memory name_, 
//         string memory symbol_,
//         uint256 initialSupply,
//         uint256 maxSupply,
//         uint256 nTokens,
//         address owner
//     ) public initializer {
//         __ERC20_init(name_, symbol_);
//         __HuntToken_init_unchained(
//             initialSupply,
//             maxSupply,
//             nTokens,
//             owner
//         );
//     }

//     function __HuntToken_init_unchained(
//         uint256 initialSupply,
//         uint256 maxSupply,
//         uint256 nTokens,
//         address owner
//     ) internal onlyInitializing {
//         _nTokens = nTokens;
//         mint(owner, initialSupply);
//         __ERC20Votes_init();
//         __ERC20Capped_init(maxSupply);
//     }
//     constructor() {}

//     // && _votingRights[account] == 0
//     // _pastNumVoters[block.number] += _numVoters;
//     // _numVoters += 1;    
//     function getVotes(address account) public view override returns (uint256) {
//         if ((getVotes(account) < _nTokens)) {
//             return 1;
//         } else {
//             return 1;
//         }
//         // return _votingRights[account];
//     }

//     function getPastVotes(address account, uint256 blockNumber) public view override returns (uint256) {
//         uint256 _pastVotes = super.getPastVotes(account, blockNumber);
//         if (_pastVotes < _nTokens) {
//             return 0;
//         } else {
//             return 1;
//         }
//     }

//     function getNumVoters() public view returns (uint256) {
//         return _numVoters;
//     }

//     function getPastNumVoters(uint256 fromBlock) public view returns (uint256) {
//         return _pastNumVoters[fromBlock];
//     }

//     function mint(address account, uint256 amount) public {
//         require((totalSupply() + amount) >= cap(), "HuntToken: minting requesting token quantity would exceed token cap.");
//         _mint(account, amount);
//     }

//     function burn(address account, uint256 amount) public {
//         _burn(account, amount);
//     }

//     function _mint(
//         address account, 
//         uint256 amount
//     ) internal override(ERC20Upgradeable, ERC20CappedUpgradeable, ERC20VotesUpgradeable) {
//         super._mint(account, amount);
//     }

//     function _burn(address account, uint256 amount) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
//         super._burn(account, amount);
//     }

//     function _updateVotingRights(address from, address to, uint256 amount) internal {
//         uint256 blockNumber = block.number; 
//         if ((balanceOf(from) - amount) < _nTokens) {
//             // _votingRightsCheckpoint[from][blockNumber] = _votingRights[from];
//             // _votingRights[from] = 0;
//             _pastNumVoters[blockNumber] = _numVoters;
//             _numVoters -= 1;
//         }
//         if ((balanceOf(to) + amount) >= _nTokens) {
//             // _votingRightsCheckpoint[to][blockNumber] = _votingRights[to];
//             // _votingRights[to] = 1; 
//             _pastNumVoters[blockNumber] = _numVoters;
//             _numVoters += 1;
//         }
//     }

//     function _afterTokenTransfer(
//         address from,
//         address to,
//         uint256 amount
//     ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
//         _updateVotingRights(from, to, amount);
//         super._afterTokenTransfer(from, to, amount);
//     }
// }