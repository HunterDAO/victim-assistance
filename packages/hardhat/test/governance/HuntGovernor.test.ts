const { expect } = require('../chai-setup');
import { ethers, web3 } from 'hardhat';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { fromRpcSig } = require('ethereumjs-util');

const Enums = require('../helpers/enums');
// const { EIP712Domain } = require('../helpers/eip712');
const { GovernorHelper } = require('../helpers/governance');

// const {
  // shouldSupportInterfaces,
// } = require('../utils/introspection/SupportsInterface.behavior');

describe('Governor', function () {
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let proposer: SignerWithAddress;
  let delegator: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  let voter4: SignerWithAddress;

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

  const tokenSupply = web3.utils.toWei('100');

  // const votingDelay = BigNumber.from('19636');
  const votingDelay = BigNumber.from('1');
  const votingPeriod = BigNumber.from('10');
  const value = web3.utils.toWei('1');
  const drValue = BigNumber.from('1');

  const huntName = 'HuntToken';
  const huntSymbol = 'HUNT';

  const version = '1';

  const tokenName = 'HunterDAO - Donor Rewards NFT';
  const tokenSymbol = 'HDDR';

  const tokenUri1: string = 'ipfs://abcdefg-HDDR-1';
  const tokenUri2: string = 'ipfs://abcdefg-HDDR-2';
  const tokenUri3: string = 'ipfs://abcdefg-HDDR-3';
  const tokenUri4: string = 'ipfs://abcdefg-HDDR-4';
  const tokenUri5: string = 'ipfs://abcdefg-HDDR-5';
  const tokenUri6: string = 'ipfs://abcdefg-HDDR-6';

  let chainId: number;
  let latestBlock: any;

  let helper: any;

  let proposal: any;

  before(async function () {
    [ owner, treasury, delegator, proposer, voter1, voter2, voter3, voter4 ] = await ethers.getSigners();
    
    // Registry = await ethers.getContractFactory('HuntRegistry');
    HuntToken = await ethers.getContractFactory('HuntToken');
    DonorRewards = await ethers.getContractFactory('DonorRewardsNFT');
    // VictimAssistance = await ethers.getContractFactory('VictimAssistanceFactory');
    Governor = await ethers.getContractFactory('HuntGovernor');
    CallReceiver = await ethers.getContractFactory('CallReceiverMock');
  });

  beforeEach(async function () {
    hunt = await HuntToken.connect(owner).deploy();
    donorRewards = await DonorRewards.connect(owner).deploy();
    governor = await Governor.deploy(donorRewards.address);     // , timelock.address
    receiver = await CallReceiver.deploy();
    helper = new GovernorHelper(governor);
  });  
    // registry = await Registry.deploy();
    // await registry.setHuntToken(hunt.address);
    // await registry.setDonorRewards(donorRewards.address);

    // victimAssistance = await VictimAssistance.deploy();
    // victimAssistance.initialize(registry.address);
  
    // registry.setVictimAssistanceFactory(victimAssistance.address);
  // });  

  // shouldSupportInterfaces([
  //   'ERC165',
  //   'ERC1155Receiver',
  //   'Governor',
  //   'GovernorWithParams',
  // ]);

  it('deployment check', async function () {
    expect(await governor.name()).to.be.equal(name);
    expect(await governor.token()).to.be.equal(donorRewards.address);
    expect(await governor.votingDelay()).to.equal(BigNumber.from('1'));
    expect(await governor.votingPeriod()).to.equal(BigNumber.from('10'));
    expect(await governor.quorum(BigNumber.from('0'))).to.equal(BigNumber.from('0'));
    expect(await governor.COUNTING_MODE()).to.be.equal('support=bravo&quorum=for,abstain');
  });

  describe('governance', async function () {
    it('should create a new proposal', async function () {
      proposal = await helper.setProposal([
        {
          target: receiver.address,
          data: receiver.interface.encodeFunctionData("mockFunction", []),
          value,
        },
      ], '<proposal description>');
    // });

    // it('should mint some tokens', async function () {
      await donorRewards.connect(owner).safeMint(voter1.address, tokenUri1);
      await donorRewards.connect(owner).safeMint(voter2.address, tokenUri2);
      await donorRewards.connect(owner).safeMint(voter3.address, tokenUri3);
      await donorRewards.connect(owner).safeMint(voter4.address, tokenUri4);
      await donorRewards.connect(owner).safeMint(proposer.address, tokenUri5);
      await donorRewards.connect(owner).safeMint(proposer.address, tokenUri6);
    // });

    // it('should delegate voting rights', async function () {
      await donorRewards.connect(proposer).delegate(proposer.address);
      await donorRewards.connect(proposer).delegate(proposer.address);
      await donorRewards.connect(voter1).delegate(voter1.address);
      await donorRewards.connect(voter2).delegate(voter2.address);
      await donorRewards.connect(voter3).delegate(voter3.address);
      await donorRewards.connect(voter4).delegate(voter4.address);
    // });  

    // it('should not have voted', async function () {
      // Before
      expect(await governor.hasVoted(BigNumber.from(proposal.id), owner.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), delegator.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter1.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter2.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter3.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter4.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), proposer.address)).to.be.equal(false);
    // });

    // it('should have proper balances', async function () {
      expect(await donorRewards.balanceOf(owner.address)).to.equal(BigNumber.from('0'));
      expect(await donorRewards.balanceOf(proposer.address)).to.equal(BigNumber.from('2'));
      expect(await donorRewards.balanceOf(voter1.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter2.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter3.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter4.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(delegator.address)).to.equal(BigNumber.from('0'));
    // });

    // it('should create the proposal', async function () {   
      const result = helper.propose({ from: proposer });

      // const startBlock = BigNumber.from(result.blockNumber).add(votingDelay).toNumber();
      // const endBlock = BigNumber.from(result.blockNumber).add(votingDelay).add(votingPeriod).toNumber();

      // expectEvent(
        // result,
        // 'ProposalCreated',
        // {
          // proposalId: BigNumber.from(proposal.id),
          // proposer: proposer.address,
          // targets: proposal.targets,
          // values: proposal.values,
          // signatures: proposal.signatures,
          // calldatas: proposal.data,
          // startBlock: startBlock,
          // endBlock: endBlock,
          // description: proposal.description,
        // },
      // );

      await expect(result).to.be.emit(governor, 'ProposalCreated');

      await time.advanceBlock(); 
      await time.advanceBlock(); 
    // });
      
    // it('should open the voting period', async function () {
      const vTX1 = helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter1 });
      await expect(vTX1).to.be.emit(governor, 'VoteCast');

      const vTX2 = helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter2 });
      await expect(vTX2).to.be.emit(governor, 'VoteCast');

      const vTX3 = helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter3 });
      await expect(vTX3).to.be.emit(governor, 'VoteCast');

      const vTX4 = helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter4 });
      await expect(vTX4).to.be.emit(governor, 'VoteCast');

      latestBlock = await time.latestBlock();
      
      await time.advanceBlockTo( 37 + 10 );
    // });

    // it('should execute the proposal', async function () {

      // const txExecute = await helper.execute({ from: governor });

      const txExecuteArgs  = [ 
        proposal.targets ? proposal.targets : [], 
        [ receiver.address ],
        proposal.values ? proposal.values : [], 
        proposal.fulldata ? proposal.fulldata : [], 
        proposal.descriptionHash
      ];

      // const txExecute = await governor.connect(owner).execute( ...txExecuteArgs );

      // await expect(txExecute).to.be.emit(governor, 'ProposalExecuted');

      const tx = receiver.mockFunction([]);

      await expect(tx).to.emit(receiver, 'MockFunctionCalled');
    // });

    // it('should have a record of voting after', async function () {
      // After
      expect(await governor.hasVoted(BigNumber.from(proposal.id), owner.address)).to.be.equal(false);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter1.address)).to.be.equal(true);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter2.address)).to.be.equal(true);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter3.address)).to.be.equal(true);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), voter4.address)).to.be.equal(true);
      expect(await governor.hasVoted(BigNumber.from(proposal.id), delegator.address)).to.be.equal(false);
    // });
      
    // it('should has the right balances after', async function () {
      expect(await donorRewards.balanceOf(owner.address)).to.equal(BigNumber.from('0'));
      expect(await donorRewards.balanceOf(voter1.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter2.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter3.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(voter4.address)).to.equal(BigNumber.from('1'));
      expect(await donorRewards.balanceOf(proposer.address)).to.equal(BigNumber.from('2'));
      expect(await donorRewards.balanceOf(delegator.address)).to.equal(BigNumber.from('0'));
    });
  });
});