// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

// import "./TimeLock.sol";

import "../tokens/HuntToken.sol"; 
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

//  is AccessControl
contract HuntRegistry {

    // using Address for address;

    // bytes32 private GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    // bytes32 private VICTIM_ASSISTANCE_ROLE = keccak256("VICTIM_ASSISTANCE_ROLE");

    struct VictimAssistance {
        address campaign;
        address vault;
        address payable _paymentSplitter;
    }

    HuntToken internal _hunt;
    // address public _hunt;
    uint256 public tokensToVote;
    
    ERC721Votes internal _donorRewards;
    // address public _donorRewards;

	address public governor;
	address payable public treasury;
	address public opSec;
	address public victimAssistanceFactory;

    VictimAssistance[] private victimAssistance;

	// address public router;
	// address public distributor;

	event HuntTokenChanged(address huntToken);
    event TokensToVoteChanged(uint256 tokens);
    event DonorRewardsNFTChanged(address donorRewards);

	event GovernorChanged(address governor);
	event SecOpsChanged(address opSec);
	event TreasuryChanged(address treasury);
	event VictimAssistanceFactoryChanged(address victimAssistanceFactory);

    event VictimAssistanceDeployed(address campaign, address vault, uint256 victimAssistanceId);

    // event DonorRegistered(address donor, uint256 donation, uint256 victimAssistanceId);

    // event RouterChanged(address router);
	// event DistributorChanged(address distributor);

    // function initialize(
    //     address _hunt,
    //     address _donorRewards,
    //     uint256 _tokensToVote,
    //     address _opSec,
    //     address payable _treasury,
	//     address _victimAssistanceFactory
    // )
        // public
        // initializer
    // {
        // __HuntRegistry_init_unchained(
    //         _hunt,
    //         _donorRewards,
    //         _tokensToVote,
    //         _opSec,
    //         _treasury,
    //         _victimAssistanceFactory
        // );
    // }

    // function __HuntRegistry_init_unchained(
    //     address _hunt,
    //     address _donorRewards,
    //     uint256 _tokensToVote,
    //     address _opSec,
    //     address payable _treasury,
	//     address _victimAssistanceFactory
    // ) 
        // internal
        // onlyInitializing
    // {
    //     hunt = _hunt;
    //     donorRewards = _donorRewards;
    //     tokensToVote = _tokensToVote;
    //     opSec = _opSec;
    //     governor = _msgSender();
    //     treasury = _treasury;
	//     victimAssistanceFactory = _victimAssistanceFactory;
        // grantRole(GOVERNOR_ROLE, _msgSender());
    // }

	constructor() {
        // grantRole(GOVERNOR_ROLE, _msgSender());
        // _disableInitializers();    
    }

    // onlyGovernor
	function setTokensToVote(
        uint256 _tokensToVote
    ) 
        external
    {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setTokensToVote: unauthorized");

		tokensToVote = _tokensToVote;
		emit TokensToVoteChanged(_tokensToVote);
	}

    // onlyGovernor
	function setHuntToken(
        address hunt_
    ) 
        external
    {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setHuntToken: unauthorized");

		_hunt = HuntToken(hunt_);
        emit HuntTokenChanged(hunt_);
	}

    function hunt() public view returns (address) {
        return address(_hunt);
    }

    // onlyGovernor
	function setDonorRewards(
        address donorRewards_
    )
        external
    {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setDonorRewards: unauthorized");

		_donorRewards = ERC721Votes(donorRewards_);
        emit DonorRewardsNFTChanged(donorRewards_);
	}

    function donorRewards() public view returns (address) {
        return address(_donorRewards);
    }

    // onlyGovernor
	function setGovernor(
        address _governor
    ) 
        external
    {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setGovernor: unauthorized");

		governor = _governor;
		emit GovernorChanged(_governor);
	}

    // onlyGovernor
	function setTreasury(address 
    payable _treasury
  
      )
    external
     {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setTreasury: unauthorized");

		treasury = _treasury;
		emit TreasuryChanged(_treasury);
	}
    
    // onlyGovernor
	function setSecOps(
        address _opSec
    )
        external
    {
        // require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) || hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setSecOps: unauthorized");

		opSec = _opSec;
		emit SecOpsChanged(_opSec);
	}

	function setVictimAssistanceFactory(
        address _victimAssistanceFactory
    )
        external
    {
        // require(hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#setVictimAssistanceFactory: unauthorized");

		victimAssistanceFactory = _victimAssistanceFactory;
		emit VictimAssistanceFactoryChanged(_victimAssistanceFactory);
	}

	function registerVAC(
        address _campaign,
        address _vault
        // address payable _paymentSplitter
    ) 
        external 
        // onlyRole(VICTIM_ASSISTANCE_ROLE)
        returns (uint256)
    {
        // require(hasRole(VICTIM_ASSISTANCE_ROLE, _msgSender()) || hasRole(GOVERNOR_ROLE, _msgSender()), "HuntRegistry#registerVAC: unauthorized");

        victimAssistance.push(
            VictimAssistance(_campaign, _vault, payable(0))
        );
        uint256 victimAssistanceId = victimAssistance.length - 1;

		emit VictimAssistanceDeployed(_campaign, _vault, victimAssistanceId);

        return victimAssistanceId;
	}

    // onlyGovernor
	// function setFeeRegistry(address _registry) external {
	// 	feeRegistry = _registry;
	// 	emit FeeRegistryChanged(_registry);
	// }

    // onlyGovernor
	// function setRouter(address _router) external {
		// router = _router;
		// emit RouterChanged(_router);
	// }

    // onlyGovernor
	// function setDistributor(address _distributor) external {
		// distributor = _distributor;
		// emit DistributorChanged(_distributor);
	// }

}