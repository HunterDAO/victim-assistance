// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ERC721PaymentSplitter
 * @author hanselb  
 * @dev Extension of ERC721 with the PaymentSplitter, a standardized way to split Ether and ERC20 payments
 * among a group of accounts, split can be  in equal parts and based on {totalSupply} and {ownerOf}.
 *
 * In this Extension PaymentSplitter {_totalShares} is a funciton which returns ERC721Enumerable
 * {totalSupply}, each token owner receives `1` share. {tokenOfOwnerByIndex} is used at the time of
 * release to get the current owner to release the payments.
 *
 * IMPORTANT: On transfer, any pending payment will be released to the previous owner or kept in the token.
 * This can be modified by setting property {_releaseOnTransfer} to false.
 */
abstract contract ERC721PaymentSplitter is ERC721, ERC721Enumerable, AccessControl {

    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN = keccak256("ADMIN_ROLE");
    
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(IERC20 indexed token, address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);
    event ERC20PaymentReceived(IERC20 indexed token, address to, uint256 amount);

    address payable internal _orgAddress;
    address payable internal _clientAddress;

    uint256 private _totalReleased;
    uint256 private _totalERC20Released;

    uint256 internal _totalShareholderPayouts;
    bool internal _releaseOnTransfer;

    uint256 internal _orgFee; 
    uint256 internal _maxPayout; 
    uint256 public _totalRevenue;
    uint256 public _pendingRevenue;


    // struct Certificate {
    //     uint256 share;
    //     uint256 contribution;
    //     address donor;
    //     IERC20 payoutToken;
    // }

    // Certificate[] private certificates;

    mapping(address => uint256) internal _certificateOf;

    Counters.Counter private _certificateCount;
    mapping(uint256 => bool) private _certificateRedeemed;
    mapping(uint256 => uint256) private _certificateRevShare;

    mapping(uint256 => uint256) private _releasedForCertificate;
    mapping(IERC20 => uint256) private _erc20TotalReleased;
    mapping(IERC20 => mapping(uint256 => uint256)) private _erc20ReleasedForCert;
    mapping(IERC20 => uint256) private _erc20TotalRevenue;
    mapping(IERC20 => uint256) private _erc20PendingRevenue;

    modifier onlyAdmin() {
        require(hasRole(ADMIN, _msgSender()), "Only addresses with admin priveledges can initiate a MassPayout");
        _;
    }

    constructor(
        string memory _title, 
        string memory _symbol,
        address _adminAddress
    ) ERC721(_title, _symbol) {
        grantRole(ADMIN, _adminAddress);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
        (, uint256 shareholderPayment,) = _pendingPayment(tokenId);
        if (from != address(0) && shareholderPayment > 0 && _releaseOnTransfer && !_certificateRedeemed[tokenId]) {
            _sendShares(tokenId);
        }
    }

    /**
     * @dev The Ether received will be logged with {PaymentReceived} events. Note that these events are not fully
     * reliable: it's possible for a contract to receive Ether without triggering this function. This only affects the
     * reliability of the events, and not the actual splitting of Ether.
     *
     * To learn more about this see the Solidity documentation for
     * https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function[fallback
     * functions].
     */
    receive() external payable {
        _totalRevenue += msg.value;
        _pendingRevenue += msg.value;
        emit PaymentReceived(_msgSender(), msg.value);
    }

    function receiveERC20(IERC20 token) external payable {
        _erc20TotalRevenue[token] += msg.value;
        _erc20PendingRevenue[token]   += msg.value;
        emit ERC20PaymentReceived(token, _msgSender(), msg.value);
    }

    fallback() external payable {
        _totalRevenue += msg.value;
        _pendingRevenue += msg.value;
        emit PaymentReceived(_msgSender(), msg.value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _sendShares(address payable account) internal {
        require(_pendingRevenue > 0, "No revenue to distribute.");
        uint256 tokenId = _certificateOf[account];
        require(_certificateRedeemed[tokenId]);
        uint256 _ownedTokens = balanceOf(account);
        require(_ownedTokens > 0, "ERC721PaymentSplitter: account has no tokens");
        (uint256 clientPayment, uint256 shareholderPayment, uint256 orgPayment) = _pendingPayment(account);
        uint256 totalPayment = (clientPayment + shareholderPayment + orgPayment);

        Address.sendValue(_clientAddress, clientPayment);  
        Address.sendValue(account, shareholderPayment);
        Address.sendValue(_orgAddress, orgPayment);

        _pendingRevenue = 0;
        _totalReleased += totalPayment;
        _certificateRedeemed[tokenId] = true;

        emit PaymentReleased(_clientAddress, clientPayment);
        emit PaymentReleased(account, shareholderPayment);
        emit PaymentReleased(_orgAddress, orgPayment);
    }

    function _sendShares(uint256 tokenId) internal {
        require(_pendingRevenue > 0, "No revenue to distribute.");
        require(_certificateRedeemed[tokenId]);
        address payable tokenOwner = payable(ownerOf(tokenId));
        require(tokenOwner != address(0), "ERC721PaymentSplitter: tokenId owner is the zero address");
        (uint256 clientPayment, uint256 shareholderPayment, uint256 orgPayment) = _pendingPayment(tokenId);
        uint256 totalPayment = (clientPayment + shareholderPayment + orgPayment);

        Address.sendValue(_clientAddress, clientPayment);  
        Address.sendValue(tokenOwner, shareholderPayment);
        Address.sendValue(_orgAddress, orgPayment);
        
        _pendingRevenue = 0;
        _totalReleased += totalPayment;
        _releasedForCertificate[tokenId] += totalPayment;
        _certificateRedeemed[tokenId] = true;
        
        emit PaymentReceived(_clientAddress, clientPayment);
        emit PaymentReleased(tokenOwner, shareholderPayment);
        emit PaymentReleased(_orgAddress, orgPayment);
    }

    /**
     * @dev Triggers a transfer to `account` of the amount of `token` tokens they are owed, according to their
     * percentage of the total shares and their previous withdrawals. `token` must be the address of an IERC20
     * contract.
     */
    function _sendShares(IERC20 token, uint256 tokenId) internal {
        require(_erc20PendingRevenue[token] > 0, "No ERC20 revenue to distribute.");
        require(_certificateRedeemed[tokenId]);
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner != address(0), "ERC721PaymentSplitter: tokenId owner is the zero address");
        (uint256 clientPayment, uint256 shareholderPayment, uint256 orgPayment) = _pendingPayment(token, tokenId);
        uint256 totalPayment = (clientPayment + shareholderPayment + orgPayment);

        _erc20PendingRevenue[token] = 0;
        _erc20ReleasedForCert[token][tokenId] += totalPayment;
        _erc20TotalReleased[token] += totalPayment;
        _certificateRedeemed[tokenId] = true;

        SafeERC20.safeTransfer(token, _clientAddress, clientPayment);  
        SafeERC20.safeTransfer(token, tokenOwner, shareholderPayment);
        SafeERC20.safeTransfer(token, _orgAddress, orgPayment);

        emit ERC20PaymentReleased(token, _clientAddress, clientPayment);
        emit ERC20PaymentReleased(token, tokenOwner, shareholderPayment);
        emit ERC20PaymentReleased(token, _orgAddress, orgPayment);
    }

    function _sendShares(IERC20 token, address payable account) internal {
        require(_erc20PendingRevenue[token] > 0, "No ERC20 revenue to distribute.");
        uint256 tokenId = _certificateOf[account];
        require(_certificateRedeemed[tokenId] == false);
        (uint256 clientPayment, uint256 shareholderPayment, uint256 orgPayment) = _pendingPayment(token, account);
        uint256 totalPayment = (clientPayment + shareholderPayment + orgPayment);

        _erc20PendingRevenue[token] = 0;
        _erc20ReleasedForCert[token][tokenId] += totalPayment;
        _erc20TotalReleased[token] += totalPayment;
        _certificateRedeemed[tokenId] = true;

        SafeERC20.safeTransfer(token, _clientAddress, clientPayment);  
        SafeERC20.safeTransfer(token, account, shareholderPayment);
        SafeERC20.safeTransfer(token, _orgAddress, orgPayment);

        emit ERC20PaymentReleased(token, _clientAddress, clientPayment);
        emit ERC20PaymentReleased(token, account, shareholderPayment);
        emit ERC20PaymentReleased(token, _orgAddress, orgPayment);
    }
    function _fee() private view returns (uint256, bool) {
        uint256 fee = _pendingRevenue * _orgFee;
        bool releaseFallback = fee <= _maxPayout;
        return (fee, releaseFallback);
    }

    function _fee(IERC20 token) private view returns (uint256, bool) {
        uint256 fee = _erc20PendingRevenue[token] * _orgFee;
        bool releaseFallback = fee <= _maxPayout;
        return (fee, releaseFallback);
    }

    function _pendingPayment(uint256 tokenId) private view returns (uint256, uint256, uint256) {
        (uint256 fee, bool releaseFallback) = _fee();
        uint256 recipient;
        uint256 org;
        if (releaseFallback) {
            recipient = (fee * uint256(60)) / _certificateRevShare[tokenId];
            org = fee - recipient;
        } else {
            recipient = fee / _certificateRevShare[tokenId];
            org = fee - recipient;
        }
        uint256 client = _pendingRevenue - (recipient + org);
        require(client > 0 && org > 0 && recipient > 0, "ERC721PaymentSplitter: account is not due payment");
        return (client, recipient, org);
    }

    function _pendingPayment(address account) private view returns (uint256, uint256, uint256) {
        (uint256 fee, bool releaseFallback) = _fee();
        uint256 tokenId = _certificateOf[account];
        uint256 recipient;
        uint256 org;
        if (releaseFallback) {
            recipient = (fee * uint256(60)) / _certificateRevShare[tokenId];
            org = fee - recipient;
        } else {
            recipient = fee / _certificateRevShare[tokenId];
            org = fee - recipient;
        }
        uint256 client = _pendingRevenue - (recipient + org);
        require(client > 0 && org > 0 && recipient > 0, "ERC721PaymentSplitter: account is not due payment");
        return (client, recipient, org);
    }

    function _pendingPayment(IERC20 token, uint256 tokenId) private view returns (uint256, uint256, uint256) {
        (uint256 fee, bool releaseFallback) = _fee(token);
        uint256 recipient;
        uint256 org;
        if (releaseFallback) {
            recipient = (fee * uint256(60)) * _certificateRevShare[tokenId];
            org = fee - recipient;
        } else {
            recipient = fee * _certificateRevShare[tokenId];
            org = fee - recipient;
        }
        uint256 client = _erc20PendingRevenue[token] - (recipient + org);
        require(client > 0 && org > 0 && recipient > 0, "ERC721PaymentSplitter: account is not due payment");
        return (client, recipient, org);
    }

    function _pendingPayment(IERC20 token, address account) private view returns (uint256, uint256, uint256) {
        (uint256 fee, bool releaseFallback) = _fee(token);
        uint256 tokenId = _certificateOf[account];
        uint256 recipient;
        uint256 org;
        if (releaseFallback) {
            recipient = (fee * 6) / _certificateRevShare[tokenId];
            org = fee - recipient;
        } else {
            recipient = fee / _certificateRevShare[tokenId];
            org = fee - recipient;
        }
        uint256 client = _erc20PendingRevenue[token] - (recipient + org);
        require(client > 0 && org > 0 && recipient > 0, "ERC721PaymentSplitter: account is not due payment");
        return (client, recipient, org);
    }

    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    function released(uint256 tokenId) public view returns (uint256) {
        return _releasedForCertificate[tokenId];
    }

    /**
     * @dev Getter for the amount of `token` tokens already released to a payee. `token` should be the address of an
     * IERC20 contract.
     */
    function released(IERC20 token, uint256 tokenId) public view returns (uint256) {
        return _erc20ReleasedForCert[token][tokenId];
    }

    /**
     * @dev Getter for the total amount of `token` already released. `token` should be the address of an IERC20
     * contract.
     */
    function totalReleased(IERC20 token) public view returns (uint256) {
        return _erc20TotalReleased[token];
    }

    /**
     * @dev Mint function sets contributor share to share = donation / totalCollected 
     */
    function mint(
        uint256 share,
        address recipient
    ) public {
        require(balanceOf(recipient) < 1, "There can only be one certificate per donor."); 
        _certificateCount.increment();
        uint256 tokenId = _certificateCount.current();
        _certificateRevShare[tokenId] = share;

        _safeMint(recipient, tokenId);
    }
}
