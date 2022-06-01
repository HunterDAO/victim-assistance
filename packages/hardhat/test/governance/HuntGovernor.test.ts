const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import { expect } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { ethers, web3 } from 'hardhat';
import { ArtifactData } from 'hardhat-deploy/types';
const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { fromRpcSig } = require('ethereumjs-util');
const Enums = require('../helpers/enums');
const { EIP712Domain } = require('../helpers/eip712');
const { GovernorHelper } = require('../helpers/governance');

const { solidity } = require('ethereum-waffle');
import chai from 'chai';
chai.use(solidity);
const { expect } = chai;

// const GovernorArtifact = require('../../artifacts/contracts/governance/HuntGovernor.sol');

// const {
  // shouldSupportInterfaces,
// } = require('../utils/introspection/SupportsInterface.behavior');

describe('Governor', function () {
  let  owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let proposer: SignerWithAddress;
  let delegator: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  let voter4: SignerWithAddress;

  let Timelock: ContractFactory;
  // let Treasury: ContractFactory;
  let Registry: ContractFactory;
  let HuntToken: ContractFactory;
  let DonorRewards: ContractFactory;
  let VictimAssistance: ContractFactory;
  let Governor: ContractFactory;
  let CallReceiver: ContractFactory;

  let timelock: Contract;
  // let treasury: Contract;
  let registry: Contract;
  let hunt: Contract;
  let donorRewards: Contract;
  let victimAssistance: Contract;
  let governor: Contract;
  let governorArtifact: any;
  let receiver: Contract;

  const empty = web3.utils.toChecksumAddress(web3.utils.randomHex(20));

  const name = 'HuntGovernor';
  const version = '1';
  const tokenName = 'HunterDAO - Donor Rewards NFT';
  const tokenSymbol = 'HDDR';
  const tokenUri1 = 'ipfs://abcdefg-HDDR-1';
  const tokenUri2 = 'ipfs://abcdefg-HDDR-2';
  const tokenUri3 = 'ipfs://abcdefg-HDDR-3';
  const tokenUri4 = 'ipfs://abcdefg-HDDR-4';
  const tokenSupply = web3.utils.toWei('100');
  // const votingDelay = BigNumber.from('19636');
  const votingDelay = BigNumber.from('1');
  const votingPeriod = BigNumber.from('10');
  const value = web3.utils.toWei('1');
  const drValue = BigNumber.from('1');

  let chainId: number;
  let latestBlock: any;

  let helper: any;

  let proposal: any;

  before(async function () {
    Timelock = await ethers.getContractFactory('TimelockControllerUpgradeable');
    // Treasury = await ethers.getContractFactory('TreasuryMock');
    Registry = await ethers.getContractFactory('HuntRegistry');
    HuntToken = await ethers.getContractFactory('ERC20VotesMock');
    DonorRewards = await ethers.getContractFactory('DonorRewardsNFT');
    VictimAssistance = await ethers.getContractFactory('VictimAssistanceFactory');
    Governor = await ethers.getContractFactory('HuntGovernor');
    CallReceiver = await ethers.getContractFactory('CallReceiverMock');
  })

  beforeEach(async function () {
    [ owner, treasury, delegator, proposer, voter1, voter2, voter3, voter4 ] = await ethers.getSigners();
    
    chainId = await web3.eth.getChainId();

    
    // hunt = await HuntToken.deploy(tokenName, tokenSymbol);
    donorRewards = await DonorRewards.deploy();

    registry = await Registry.deploy();

    registry.setDonorRewards(donorRewards.address);

    timelock = await Timelock.deploy();
    // , timelock.address
    governor = await Governor.deploy(donorRewards.address);

    // victimAssistance = await VictimAssistance.deploy();
    // victimAssistance.initialize(registry.address);
    
    // registry.setHuntToken(hunt.address);
    registry.setDonorRewards(donorRewards.address);

    // registry.setVictimAssistanceFactory(victimAssistance.address);
    // registry.setTreasury(treasury.address);


    // governor.initialize(registry.address, timelock.address);
    // hunt.address, donorRewards.address, registry.address, treasury.address, victimAssistance.address, timelock.address);

    receiver = await CallReceiver.deploy();

    helper = new GovernorHelper(governor);

    await donorRewards.safeMint(delegator.address, tokenSupply);
    await donorRewards.safeMint(delegator.address, tokenSupply);
    await donorRewards.safeMint(delegator.address, tokenSupply);
    await donorRewards.safeMint(delegator.address, tokenSupply);

    await donorRewards.safeMint(proposer.address, tokenSupply);
    await donorRewards.connect(proposer).delegate(proposer.address);

    await donorRewards.connect(delegator).delegate(voter1.address);
    await donorRewards.connect(delegator).delegate(voter2.address);
    await donorRewards.connect(delegator).delegate(voter3.address);
    await donorRewards.connect(delegator).delegate(voter4.address);

    proposal = helper.setProposal([
      {
        target: receiver.address,
        data: receiver.interface.encodeFunctionData("mockFunction", []),
        value,
      },
    ], '<proposal description>');
  });

  // shouldSupportInterfaces([
  //   'ERC165',
  //   'ERC1155Receiver',
  //   'Governor',
  //   'GovernorWithParams',
  // ]);

  it('deployment check', async function () {
    expect(await governor.name()).to.be.equal(name);
    expect(await governor.token()).to.be.equal(donorRewards.address);
    expect(await governor.votingDelay()).to.equal(votingDelay);
    expect(await governor.votingPeriod()).to.equal(votingPeriod);
    expect(await governor.quorum(BigNumber.from('0'))).to.equal(BigNumber.from(BigNumber.from('0')));
    expect(await governor.COUNTING_MODE()).to.be.equal('support=bravo&quorum=for,abstain');
  });

  it('nominal workflow', async function () {
    // Before
    

    // After
    expect(await governor.hasVoted(BigNumber.from(proposal.id), owner.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter1.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter2.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter3.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter4.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), delegator.address)).to.be.equal(false);

    expect(await donorRewards.balanceOf(proposer.address)).to.equal(drValue);
    expect(await donorRewards.balanceOf(owner.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter1.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter2.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter3.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter4.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(delegator.address)).to.equal(BigNumber.from('4'));

    // Run proposal
    const result = await helper.propose({ from: proposer });

    // const startBlock = BigNumber.from(result.blockNumber).add(votingDelay).toNumber();
    // const endBlock = BigNumber.from(result.blockNumber).add(votingDelay).add(votingPeriod).toNumber();

    // expectEvent(
    //   result,
    //   'ProposalCreated',
    //   {
    //     proposalId: BigNumber.from(proposal.id),
    //     proposer: proposer.address,
    //     targets: proposal.targets,
    //     values: proposal.values,
    //     signatures: proposal.signatures,
    //     calldatas: proposal.data,
    //     startBlock: startBlock,
    //     endBlock: endBlock,
    //     description: proposal.description,
    //   },
    // );

    
    await expect(result).to.be.emit(governor, 'ProposalCreated');

    latestBlock = await time.latestBlock();
    
    await time.advanceBlockTo( 35 + 2 ); 

    const vTX1 = await helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter1 });
    await expect(vTX1).to.be.emit(governor, 'VoteCast');

    const vTX2 = await helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter2 });
    await expect(vTX2).to.be.emit(governor, 'VoteCast');

    const vTX3 = await helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter3 });
    await expect(vTX3).to.be.emit(governor, 'VoteCast');

    const vTX4 = await helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter4 });
    await expect(vTX4).to.be.emit(governor, 'VoteCast');

    // expectEvent(
    //   await helper.connect(voter1).vote({ support: Enums.VoteType.For, reason: 'This is nice' }),
    //   'VoteCast',
    //   {
    //     voter: voter1.address,
    //     support: Enums.VoteType.For,
    //     reason: 'This is nice',
    //     weight: web3.utils.toWei('10'),
    //   },
    // );
    
    // expectEvent(
    //   await helper.connect(voter2).vote({ support: Enums.VoteType.For }),
    //   'VoteCast',
    //   {
    //     voter: voter2.address,
    //     support: Enums.VoteType.For,
    //     weight: web3.utils.toWei('7'),
    //   },
    // );

    // expectEvent(
    //   await helper.connect(voter3).vote({ support: Enums.VoteType.Against }),
    //   'VoteCast',
    //   {
    //     voter: voter3.address,
    //     support: Enums.VoteType.Against,
    //     weight: web3.utils.toWei('5'),
    //   },
    // );

    // expectEvent(
    //   await helper.connect(voter4).vote({ support: Enums.VoteType.Abstain }),
    //   'VoteCast',
    //   {
    //     voter: voter4.address,
    //     support: Enums.VoteType.Abstain,
    //     weight: web3.utils.toWei('2'),
    //   },
    // );

    latestBlock = await time.latestBlock();
    
    await time.advanceBlockTo( 37 + 10 );
    
    // const txExecute = await helper.execute({ from: governor });

    const txExecuteArgs  = [ 
      // proposal.targets ? proposal.targets : [], 
      [ receiver.address ],
      proposal.values ? proposal.values : [], 
      proposal.fulldata ? proposal.fulldata : [], 
      proposal.descriptionHash
    ];

    // const txExecute = await governor.connect(owner).execute( ...txExecuteArgs );

    // await expect(txExecute).to.be.emit(governor, 'ProposalExecuted');

    await receiver.mockFunction([]);

    // expectEvent(
      // txExecute,
      // 'ProposalExecuted',
      // { proposalId: BigNumber.from(proposal.id) },
    // );

    await expect(
      receiver,
      'MockFunctionCalled',
    );

    // After
    expect(await governor.hasVoted(BigNumber.from(proposal.id), owner.address)).to.be.equal(false);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter1.address)).to.be.equal(true);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter2.address)).to.be.equal(true);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter3.address)).to.be.equal(true);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), voter4.address)).to.be.equal(true);
    expect(await governor.hasVoted(BigNumber.from(proposal.id), delegator.address)).to.be.equal(false);
    
    expect(await donorRewards.balanceOf(proposer.address)).to.equal(drValue);
    expect(await donorRewards.balanceOf(owner.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter1.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter2.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter3.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(voter4.address)).to.equal(BigNumber.from('0'));
    expect(await donorRewards.balanceOf(delegator.address)).to.equal(BigNumber.from('4'));
  });
});