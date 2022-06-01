// SPDX-License-dIdentifier: MIT
pragma solidity ^0.8.4;

import "./governance/HuntRegistry.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Campaign
 * @author HunterDAO
 * @dev this contract is intended to handle the campaigns requesting funding
 * for financial assistance funding private investigations, or asset recovery
 * services, or cybersecurity provdIded by the HunterDAO or partner DAOs / firms.
 */
contract HuntCrowdfunding is Ownable, Pausable {

    using SafeMath for uint256;
    using Address for address;
    using Counters for Counters.Counter;

    uint256 public constant campaignDuration = 1814400;

    enum CampaignStatus {
        Active,
        Successful,
        Failed
    }

    CampaignStatus private campaignStatus;

    uint256 public startTime;
    uint256 public endTime;
    
    uint256 public maximumFunding;
    uint256 public totalCollected;

    Counters.Counter public numDonors;
    
    address payable  benificiary;
    address private vault;

    HuntRegistry private registry;
    
    mapping(address => uint256) internal donorContribution;

    event DonationReceived(address donor, uint256 contribution);
    event OverflowDonationReturned(address donor, uint256 overflow);
    event CampaignSucceeded(uint256 totalCollected);
    event CampaignFailed(uint256 totalCollected);

    modifier whenActive() {
        require((campaignStatus == CampaignStatus.Active), "HuntCrowdfunding: finalized.");
        _;
    }

    constructor(
        uint256 _maximumFunding,
        address payable _beneficiary,
        HuntRegistry _registry
    ) {
        campaignStatus = CampaignStatus.Active;
        maximumFunding = _maximumFunding;
        startTime = block.timestamp;
        endTime = startTime + campaignDuration;
        benificiary = _beneficiary;
        registry = _registry;
    }

    receive () external whenActive payable {
        _donate();
    }

    function donate() public whenActive payable {
        _donate();
    }

    function getVaultAddress() external view returns (address) {
        return address(vault);
    }

    function getNumberOfDonors() public view returns (uint256) {
        return numDonors.current();
    }

    function getDonorContribution(address _donorAddress) public view returns (uint256) {
        return donorContribution[_donorAddress];
    }

    function finalizeCampaign() public whenActive onlyOwner {
        _finalizeCampaign();
    } 

    function _donate() internal {
        require(
            (totalCollected <= maximumFunding), 
            "Campaign Funding Cap Already Satisfied"
        );
        require(
            (block.timestamp >= startTime )|| (block.timestamp < endTime), 
            "Camapaign Expired!"
        );
        require(
            (msg.value != 0), 
            "Send value cannot be zero!"
        );

        uint256 overflow;
        uint256 sendValue; 

        if ((totalCollected + msg.value) > maximumFunding) {
            overflow = maximumFunding - (totalCollected + msg.value);
            
            payable(_msgSender()).transfer(overflow);
            emit OverflowDonationReturned(_msgSender(), overflow);

            sendValue = msg.value - overflow;

            _finalizeCampaign();
        } else {
            sendValue = msg.value;
        }

        totalCollected += sendValue;
        donorContribution[_msgSender()] += sendValue;

        payable(vault).transfer(sendValue);
        
        numDonors.increment();

        emit DonationReceived(_msgSender(), sendValue);
    }

    function _finalizeCampaign() internal {
        require(
            (block.timestamp >= endTime) || (totalCollected >= maximumFunding), 
            "Campaign should remain active!"
        );
        
        if (totalCollected >= maximumFunding) {
            campaignStatus = CampaignStatus.Successful;
            emit CampaignSucceeded(totalCollected);

            // vault.unlockFunds();

            _pause();
        } else {
            campaignStatus = CampaignStatus.Failed;
            emit CampaignFailed(totalCollected);

            // vault.escapeFunds();

            _pause();
        }
    }

    /**
     * Safety Methods
     */

}