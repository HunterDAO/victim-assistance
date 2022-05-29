// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/draft-ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

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
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    ERC721VotesUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant ADMIN = keccak256("DEFAULT_ADMIN_ROLE");
    bytes32 public constant CAMPAIGN = keccak256("CAMPAIGN_ROLE");

    string private constant _name = "HunterDAO Donor Rewards";
    string private constant _symbol = "HDDR";
    string private constant _version = "v0.1.0";

    uint256 private _numVoters;

    mapping(uint256 => uint256) _numVotersCheckpoint;
    mapping(uint256 => string) public _tokenURIs;

    CountersUpgradeable.Counter private _tokenIdCounter;

    constructor(
        address _daoExecutor
    ) initializer {
        __ERC721_init(_name, _symbol);
        __EIP712_init(_name, _version);
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

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist!");
        return _tokenURIs[tokenId];
    }

    function getNumVoters() public view returns (uint256) {
        return _numVoters;
    }

    function pause() public whenNotPaused {
        _checkRole(ADMIN);
        _pause();
    }

    function unpause() public whenPaused {
        _checkRole(ADMIN);
        _unpause();
    }

    function _getVotingUnits(address account) internal view override returns (uint256) {
        if (balanceOf(account) > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) whenNotPaused {
        _updateNumVoters(from, to);
        super._beforeTokenTransfer(from, to, tokenId);
    }
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721VotesUpgradeable) {
        _updateNumVoters(from, to);
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _updateNumVoters(address from, address to) internal {
        if ((balanceOf(from) - 1) == 0) {
            _numVoters -= 1;
        } else if (balanceOf(to) == 0) {
            _numVoters += 1;
        }
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override {
        require(_exists(tokenId), "Token does not exist!");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721Upgradeable, 
            ERC721EnumerableUpgradeable, 
            AccessControlUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
