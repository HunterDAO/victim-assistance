// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/draft-ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CheckpointsUpgradeable.sol";

/// @custom:security-contact admin@hunterdao.io
contract DonorRewardsNFT is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, PausableUpgradeable, OwnableUpgradeable, EIP712Upgradeable, ERC721VotesUpgradeable {

    using CountersUpgradeable for CountersUpgradeable.Counter;
    using CheckpointsUpgradeable for CheckpointsUpgradeable.History;

    // uint256 internal nTokens = 1;

    uint256 internal voters = 0;
    CheckpointsUpgradeable.History internal votersCheckpoints;

    CountersUpgradeable.Counter private _tokenIdCounter;

    mapping(uint256 => string) private _tokenURIs;

    function initialize() external initializer {
        __ERC721_init("DonorRewardsNFT", "HDDR");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Pausable_init();
        __Ownable_init();
        __EIP712_init("DonorRewardsNFT", "1");
        __ERC721Votes_init();
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(
        address to,
        string memory uri
    ) 
        public
        whenNotPaused
        onlyOwner
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return _tokenURIs[tokenId];
    }

    function getVoters() public view returns (uint256) {
        return voters;
    } 

    function getPastVoters(uint256 blockNumber) public view returns (uint256) {
        return votersCheckpoints.getAtBlock(blockNumber);
    } 

    // The following functions are overrides required by Solidity.

    function _setTokenURI(uint256 tokenId, string memory uri) internal override {
        _tokenURIs[tokenId] = uri;
    }

    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId
    )
        internal
        whenNotPaused
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }


    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) 
        internal
        whenNotPaused
        override(ERC721Upgradeable, ERC721VotesUpgradeable) 
    {
        _updateVoters(from, to);
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _updateVoters(address from, address to) internal {
        if ((balanceOf(from) - 1) == 0) {
            votersCheckpoints.push(_subtraction, voters);
            voters -= 1;
        }
        if (balanceOf(to) == 0) {
            votersCheckpoints.push(_addition, voters);
            voters += 1;
        }
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function _addition(
        uint256 a,
        uint256 b
    )
        private
        pure
        returns (uint256)
    {
        return a + b;
    }

    function _subtraction(
        uint256 a,
        uint256 b
    )
        private
        pure
        returns (uint256)
    {
        return a - b;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
