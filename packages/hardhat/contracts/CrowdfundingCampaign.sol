pragma solidity ^0.8.4;
// SPDX-License-dIdentifier: MIT

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./Collector.sol";

        // uint256 totalContribution = get(donorContribution, _msgSender()) + sendValue;
        // set(donorContribution, _msgSender(), totalContribution);
        // return get(donorContribution, _donorAddress);

/**
 * @title Campaign
 * @author Alpine-lines (Josh Healey)
 * @dev this contract is intended to handle the campaigns requesting funding
 * for financial assistance funding private investigations, or asset recovery
 * services, or cybersecurity provdIded by the HunterDAO or partner DAOs / firms.
 */
contract CrowdfundingCampaign is Ownable, Pausable {

    using SafeMath for uint256;
    using Address for address;
    using Counters for Counters.Counter;

    enum CampaignStatus {
        Active,
        Successful,
        Failed
    }

    // struct Donor {
    //     address donorAddress;
    //     uint256 contribution;
    //     IERC20 token;
    //     uint256 erc20Contribution;
    // } TODO: Support arbitrary ERC20s

    uint256 public constant campaignDuration = 1814400;

    CampaignStatus private campaignStatus;

    uint256 private startTime;
    uint256 public endTime;
    
    uint256 public maximumFunding;
    uint256 public totalCollected;
    Counters.Counter public numDonors;
    
    address public vaultAddress;
    
    mapping(address => uint256) internal donorContribution;

    event DonationReceived(address donor, uint256 contribution);
    event OverflowDonationReturned(address donor, uint256 overflow);
    event CampaignSucceeded(uint256 totalCollected);
    event CampaignFailed(uint256 totalCollected);

    constructor(
        uint256 _maximumFunding,
        address payable _serviceProvider
    ) {
        maximumFunding = _maximumFunding;
        startTime = block.timestamp;
        endTime = startTime + campaignDuration;
        vaultAddress = address(new Collector(_serviceProvider));
        campaignStatus = CampaignStatus.Active;
    }

    receive () external payable {
        _donate();
    }

    function donate() public payable {
        _donate();
    }

    function getNumberOfDonors() public view returns (uint256) {
        return numDonors.current();
    }

    function getDonorContribution(address _donorAddress) public view returns (uint256) {
        return donorContribution[_donorAddress];
    }

    function finalizeCampaign() public onlyOwner {
        _finalizeCampaign();
    } 

    function _donate() internal {
        require(totalCollected <= maximumFunding, "Campaign Funding Cap Already Satisfied");
        require(block.timestamp >= startTime || block.timestamp < endTime, "Camapaign Expired!");
        require(msg.value != 0, "Send value cannot be zero!");

        uint256 overflow;
        uint256 sendValue; 

        if (totalCollected + msg.value > maximumFunding) {
            overflow = maximumFunding - (totalCollected + msg.value);

            payable(_msgSender()).transfer(overflow);
            emit OverflowDonationReturned(_msgSender(), overflow);

            sendValue = msg.value - overflow;

            _finalizeCampaign();
        } else {
            sendValue = msg.value;
        }

        //Track how much the Campaign has collected
        totalCollected += sendValue;
        donorContribution[_msgSender()] += sendValue;

        //Send the ether to the vault
        payable(vaultAddress).transfer(sendValue);
        numDonors.increment();
        emit DonationReceived(_msgSender(), sendValue);
    }

    function _finalizeCampaign() internal {
        require(block.timestamp >= endTime || totalCollected >= maximumFunding, "Campaign should remain active!");
        if (totalCollected >= maximumFunding) {
            emit CampaignSucceeded(totalCollected);
            _pause();
        } else {
            emit CampaignFailed(totalCollected);
            _pause();
        }
    }

    //////////
    // Safety Methods
    //////////

    /// @notice This method can be used by the controller to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    ///  set to 0 in case you want to extract ether.
    function claimTokens(address _token, address payable _recipient) public onlyOwner {
        // if (tokenContract.controller() == address(this)) {
            // tokenContract.claimTokens(_token);
        // }
        // if (_token == 0x0) {
        //     _recipient.transfer(this.balance);
        //     return;
        // }

        // IERC20 token = IERC20(_token);
        // uint256 balance = token.balanceOf(this);
        // token.transfer(_recipient, balance);
        // emit ClaimedTokens(_token, _recipient, balance);
    }

    event ClaimedTokens(address indexed _token, address indexed _controller, uint256 _amount);

}