// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Checkpoints.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";

/// @custom:security-contact admin@hunterdao.io
contract DonorRewardsNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, EIP712, ERC721Votes {

    using Counters for Counters.Counter;
    using Checkpoints for Checkpoints.History;

    uint256 internal voters = 0;
    Checkpoints.History internal votersCheckpoints;

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) private _tokenURIs;

    event SetTokenURI(uint256 tokenId, string uri);

    constructor() 
        ERC721("DonorRewardsNFT", "HDDR") 
        ERC721Enumerable()
        EIP712("DonorRewardsNFT", "1")
        ERC721URIStorage()
        Pausable()
        Ownable()
        ERC721Votes()
    { }

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
        // console.log('tokenId: ', tokenId);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
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
        emit SetTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId
    )
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
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
        override(ERC721, ERC721Votes) 
    {
        _updateVoters(from, to);
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _updateVoters(address from, address to) internal {
        if (from != address(0)) {
            if ((balanceOf(from) - 1) == 0) {
                votersCheckpoints.push(_subtraction, voters);
                voters -= 1;
            }
        }
        if (to != address(0)) {
            if (balanceOf(to) == 0) {
                votersCheckpoints.push(_addition, voters);
                voters += 1;
            }
        }
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
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
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
