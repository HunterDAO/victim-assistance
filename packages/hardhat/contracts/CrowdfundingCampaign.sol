pragma solidity ^0.8.4;
// SPDX-License-dIdentifier: MIT

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./Collector.sol";

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
    
    address private vaultAddress;
    
    mapping(address => uint256) internal donorContribution;

    event DonationReceived(address donor, uint256 contribution);
    event OverflowDonationReturned(address donor, uint256 overflow);
    event CampaignSucceeded(uint256 totalCollected);
    event CampaignFailed(uint256 totalCollected);

    constructor(
        address _serviceProvider
    ) {
        vaultAddress = new Collector(_serviceProvider);
    }

    receive () external payable {
        _donate(_owner());
    }

    fallback () external payable {
        _donate(_owner());
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
        require(now >= startTime || now < endTime, "Camapaign Expired!");
        require(msg.value != 0, "Send value cannot be zero!");

        uint256 overflow;
        uint256 sendValue; 

        if (totalCollected + msg.value > maximumFunding) {
            overflow = maximumFunding - (totalCollected + msg.value);
            if (!_msgSender().send(overflow)) {
                throw;
            } else {
                emit OverflowDonation(_msgSender(), overflow);
            }
            sendValue = msg.value - overflow;
            _finalizeCampaign();
        } else {
            sendValue = msg.value;
        }

        //Track how much the Campaign has collected
        totalCollected += sendValue;
        donorContribution[_msgSender()] += sendValue;

        //Send the ether to the vault
        if(!payable(vaultAddress).send(sendValue)) {
            throw;
        } else 
            numDonors.increment();
            emit DonationReceived(msgSender(), sendValue);
        }
    }

    function _finalizeCampaign() internal {
        require(now >= endTime || totalCollected >= maximumFunding, "Campaign should remain active!");
        if (totalCollected >= maximumFunding) {
            emit CampaignSucceeded(totalCollected);
            status = CampaignStatus.Successful;
            _pause();
        } else {
            status = CampaignStatus.Failed;
            emit CampaignFailed(totalCollected);
            _pause();
        }
    }

    // function _newDonor(
    //     address _donorAddress,
    //     uint256 _donationValue
    // ) internal {
    //     Donor memory donor = Donor(
    //         _donorAddress,
    //         _donationValue
    //     );
    //     donors[_].push(donor);
    //     donorIndex[_msgSender()] = donors[_].length - 1;
    // }

    //////////
    // Safety Methods
    //////////

    /// @notice This method can be used by the controller to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    ///  set to 0 in case you want to extract ether.
    function claimTokens(address _token) public onlyOwner {
        if (tokenContract.controller() == address(this)) {
            tokenContract.claimTokens(_token);
        }
        if (_token == 0x0) {
            owner.transfer(this.balance);
            return;
        }

        ERC20Token token = ERC20Token(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
        ClaimedTokens(_token, owner, balance);
    }

    event ClaimedTokens(address indexed _token, address indexed _controller, uint256 _amount);
}