pragma solidity ^0.8.4;
// SPDX-License-dIdentifier: MIT

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @title Campaign
 * @author Alpine-lines (Josh Healey)
 * @dev this contract is intended to handle the campaigns requesting funding
 * for financial assistance funding private investigations, or asset recovery
 * services, or cybersecurity provdIded by the HunterDAO or partner DAOs / firms.
 */
contract Crowdfunding is AccessControl {

    using SafeMath for uint256;
    using Address for address;

    address public applicationAdminAddress;
    uint256 public constant campaignDuration = 1814400;

    event ApplicationApproved(address applicant, uint256 applicationdId);
    event ApplicationDenied(address applicant, uint256 applicationdId);
    event DonationReceived(uint256 campaignId, address donor, uint256 donationValue);
    event CampaignFinalized(uint256 campaignId, uint256 totalCollected);

    enum CampaignStatus {
        Active,
        Successful,
        Failed
    }

    struct Application {
        bool approved;
        uint256 maximumFunding;
        address applicantAddress;
        address serviceProvdIderAddress;
    }

    struct Campaign {
        CampaignStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 maximumFunding;
        uint256 totalCollected;
        address vaultAddress;
        address applicantAddress;
        address serviceProvdIderAddress;
    }

    struct Donor {
        address donorAddress;
        uint256 donationValue;
        uint256 campaignId;
    }

    Application[] internal applications;
    Campaign[] internal campaigns;

    mapping(address => uint256) internal ownerToCampaignId;
    mapping(address => uint256) internal donorAddressToIndex;
    mapping(uint256 => Donor[]) internal campaignIdToDonors;

    constructor(
        address _adminAddress
    ) {
        grantRole("ADMIN", _adminAddress);
    }

    receive () external payable {
        payable(_msgSender()).send(msg.value);
    }

    fallback () external payable {
        payable(_msgSender()).send(msg.value);
    }

    function newCampaignApplication(
        uint256 _maximumFunding,
        address _serviceProvdIderAddress
    ) public {
        Application memory application = Application(
            false,
            _maximumFunding,
            _msgSender(),
            _serviceProvdIderAddress
        );
        applications.push(application);
    }

    function approveApplication(
        uint256 applicationdId
    ) public {
        require(hasRole("ADMIN", _msgSender()), "Must be admin to approve an application.");
        _approveApplication(applicationdId);
        _initiateCampaign(applicationdId);
        emit ApplicationApproved(applications[applicationdId].applicantAddress, applicationdId);
    }

    function denyApplication(
        uint256 applicationdId
    ) public {
        require(hasRole("ADMIN", _msgSender()), "Must be admin approve an application.");
        _denyApplication(applicationdId);
        emit ApplicationDenied(applications[applicationdId].applicantAddress, applicationdId);
    }

    function getApplicationStatus(uint256 applicationId) public view returns (bool) {
        return applications[applicationId].approved;
    }

    function finalizeCampaign(
        uint256 campaignId
    ) public {
        require(hasRole("ADMIN", _msgSender()), "Must be admin approve an application.");
        _setFinalCampaignStatus(campaignId);
        emit CampaignFinalized(campaignId, campaigns[campaignId].totalCollected);
    }

    function donate(
        uint256 campaignId
    ) public payable {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.endTime >= block.timestamp, "Campaign Expired");
        require(campaign.totalCollected < campaign.maximumFunding, "Campaign Funding Cap Already Satisfied");
        _newDonor(_msgSender(), msg.value, campaignId);
        _updateTotalCollected(campaignId, msg.value);
        payable(campaigns[campaignId].vaultAddress).transfer(msg.value);
        emit DonationReceived(campaignId, _msgSender(), msg.value);
    }

    function getNumberOfDonors(uint256 campaignId) public view returns (uint256) {
        return campaignIdToDonors[campaignId].length;
    }

    function _approveApplication(uint256 applicationId) internal {
        Application storage application = applications[applicationId];
        application.approved = true;
    }

    function _denyApplication(uint256 applicationId) internal {
        Application storage application = applications[applicationId];
        application.approved = false;
    }

    function _initiateCampaign(uint256 applicationId) internal {
        Application memory application = applications[applicationId];
        // TODO: implement vault address vaultAddress = address(new Vault());
        Campaign memory campaign = Campaign(
            CampaignStatus.Active,
            block.timestamp,
            block.timestamp + campaignDuration,
            application.maximumFunding,
            0,
            application.applicantAddress,
            application.applicantAddress,
            application.serviceProvdIderAddress
        );
        campaigns.push(campaign);
        uint256 campaignId = campaigns.length - 1;
        ownerToCampaignId[application.applicantAddress];
    }

    function _updateTotalCollected(
        uint256 campaignId,
        uint256 donationValue
    ) internal {
        Campaign storage campaign = campaigns[campaignId];
        campaign.totalCollected += donationValue;
    }

    function _setFinalCampaignStatus(
        uint256 campaignId
    ) internal {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.totalCollected >= campaign.maximumFunding) {
            campaign.status = CampaignStatus.Successful;
        } else {
            campaign.status = CampaignStatus.Failed;
        }
    }

    function _newDonor(
        address _donorAddress,
        uint256 _donationValue,
        uint256 _campaignId
    ) internal {
        Donor memory donor = Donor(
            _donorAddress,
            _donationValue,
            _campaignId
        );
        campaignIdToDonors[_campaignId].push(donor);
        donorAddressToIndex[_msgSender()] = campaignIdToDonors[_campaignId].length - 1;
    }

    //////////
    // Safety Methods
    //////////

    /// @notice This method can be used by the controller to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    ///  set to 0 in case you want to extract ether.
    function claimTokens(address _token, address payable _recipient) public {
        require(hasRole("ADMIN", _msgSender()), "Only ADMINs can claim tokens!");
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