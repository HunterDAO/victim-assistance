// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./external/ERC721PaymentSplitter.sol";

contract RevShareAgreement is ERC721PaymentSplitter {

    
    string public projectName;

    constructor(
        string memory _projectName,
        uint256 orgFee,
        uint256 totalContributed,
        address payable orgAddress,
        address payable clientAddress,
        address adminAddress,
        bool releaseOnTransfer
    ) ERC721PaymentSplitter(_projectName, "HDREV", adminAddress) {
        // ERC721(_projectName, "HDREV")
        _projectName = _projectName;
        _orgFee = orgFee;
        _maxPayout = totalContributed;
        _orgAddress = orgAddress;
        _clientAddress = clientAddress;
        _releaseOnTransfer = releaseOnTransfer;
    }

    function adminMassPayout() public {
        require(hasRole(ADMIN, _msgSender()), "Only addresses with admin priveledges can initiate a MassPayout");
        for (uint256 i = 0; i < totalSupply(); i++) {
            _sendShares(i);
        }
    }

    function donorWithdrawl() public {
        require(balanceOf(_msgSender()) < 1, "Only certificate owner can initiate withdrawl");
        require(balanceOf(_msgSender()) > 1, "Address can only own 1 certificate initiate withdrawl");
        _sendShares(_certificateOf[_msgSender()]);
    }
}