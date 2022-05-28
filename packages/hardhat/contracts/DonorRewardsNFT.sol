// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/***
 * @title DonorRewardsNFT
 * @author IntelliDAO
 * @notice This contract is intended to be utilized as a reward for donations made
 * to any victim defense campaign in the IntelliDAO Crowdfunding Platform. These
 * tokens will provide access to DAO membership including exclusive areas of the DAO
 * such as the crowdfunding governance processes and related channels of communication,
 * i.e. Discord, Discourse, and Colony. Similarly, discounts will be granted to token
 * holders for their purchase of any IntelliDAO-branded merchandise or in-person
 * hackathon tickets. Finally, token holders will be able to transfer the rights to
 * redeem their share of any recovered funds received by the DAO when law enforcement
 * action or private lawsuits produce victim compensation following the DAO's fee
 * collection and subsequent contributor allocation.

 * @dev Integrate lit protocol in victim-assistance-dapp
 * @dev Add mintgate event ticket for next upcoming IntelliDAO hackathon (in-person)
 * @dev Add the ability to track the contributorID from the RevenueAllocator.sol contract stored
 * in the originDonorAddressToContributorID mapping.
 * @dev Track redepemption of revenue share withdrawl rights using bool value named revShareRedeemed.
 */
contract DonorRewardsNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("HunterDAO Donor Rewards", "HDDR") {}

    function safeMint(address to, string memory _tokenURI) public onlyOwner {
        _safeMint(to, _tokenIdCounter.current());
        _setTokenURI(_tokenIdCounter.current(), _tokenURI);
        _tokenIdCounter.increment();
    }

    function updateTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        onlyOwner
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return _tokenURIs[tokenId];
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
