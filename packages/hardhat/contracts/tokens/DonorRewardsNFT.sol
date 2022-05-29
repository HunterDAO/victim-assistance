// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
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
    // ERC721Votes,
    Pausable,
    AccessControl
{
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 public constant CAMPAIGN = keccak256("CAMPAIGN_ROLE");

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) public _tokenURIs;

    constructor(
        address _daoExecutor
    ) ERC721("HunterDAO Donor Rewards", "HDDR") {
        _setupRole(ADMIN, _daoExecutor);
        _setupRole(CAMPAIGN, _msgSender());
    }

    function safeMint(address to, string memory _tokenURI) public whenNotPaused {
        require(hasRole(CAMPAIGN, _msgSender()) || hasRole(ADMIN, _msgSender()), "Must be HuntCrowdfunding contract or admin!");
        _safeMint(to, _tokenIdCounter.current());
        _setTokenURI(_tokenIdCounter.current(), _tokenURI);
        _tokenIdCounter.increment();
    }

    function updateTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        whenNotPaused 
    {
        require(hasRole(CAMPAIGN, _msgSender()) || hasRole(ADMIN, _msgSender()), "Must be HuntCrowdfunding contract or admin!");
        _setTokenURI(tokenId, _tokenURI);
    }

    function pause() public whenNotPaused {
        _checkRole(ADMIN);
        _pause();
    }

    function unpause() public whenPaused {
        _checkRole(ADMIN);
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
        require(_exists(tokenId), "Token does not exist!");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist!");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721, 
            ERC721Enumerable, 
            // ERC721Votes, 
            AccessControl
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
