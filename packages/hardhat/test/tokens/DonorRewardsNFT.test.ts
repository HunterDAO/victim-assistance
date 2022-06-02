// import { 
//     BigNumber, 
//     Contract, 
//     ContractFactory
// } from "ethers";
// import { expect } from "../chai-setup";
// import { ethers } from "hardhat";

// import { promisify } from 'util';
// const queue = promisify(setImmediate);

// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// const { expectEvent, time } = require('@openzeppelin/test-helpers');

// const { shouldBehaveLikeVotes } = require('../governance/utils/Votes.behavior');

// describe('DonorRewardsNFT', () => {
//     let daoExecutor: SignerWithAddress;
//     let daoTreasury: SignerWithAddress;
//     let campaign: SignerWithAddress;
//     let beneficiary: SignerWithAddress;
//     let donor1: SignerWithAddress;
//     let donor2: SignerWithAddress;
//     let donor3: SignerWithAddress;
//     let account1: SignerWithAddress;
//     let account1Delegatee: SignerWithAddress;
//     let account2: SignerWithAddress;
//     let account2Delegatee: SignerWithAddress;
//     let other1: SignerWithAddress;
//     let other2: SignerWithAddress;
//     let accounts: SignerWithAddress[];

//     let HuntCrowdfunding: ContractFactory;
//     let huntCrowdfunding: Contract;

//     let DonorRewards: ContractFactory;
//     let donorRewards: Contract;

//     let event: any;
//     let logIndex: any;

//     const name = 'HunterDAO Donor Rewards NFT';
//     const symbol = 'HDDR';
//     const version = '0.3.1';

//     const maximumFunding = ethers.utils.parseEther('2');


//     beforeEach(async () => {
//         [
//           daoExecutor, 
//           daoTreasury, 
//           campaign, 
//           beneficiary,
//           donor1, 
//           donor2, 
//           donor3, 
//           account1, 
//           account1Delegatee, 
//           account2, 
//           account2Delegatee, 
//           ...accounts
//         ] = await ethers.getSigners();

//         HuntCrowdfunding = await ethers.getContractFactory("HuntCrowdfunding");
//         huntCrowdfunding = await HuntCrowdfunding.deploy();
//         huntCrowdfunding.initialize(
//           maximumFunding,
//           beneficiary.address,
//           daoTreasury.address
//         );

//         DonorRewards = await ethers.getContractFactory("DonorRewardsNFT");
//         donorRewards = await DonorRewards.deploy();
//         donorRewards.initialize(huntCrowdfunding.address);
//     });

//     describe("Minting", () => {

//         it("Should have the correct name", async () => {
//           expect(await donorRewards.name()).to.equal(name);
//         });

//         it("Should have the correct symbol", async () => {
//           expect(await donorRewards.symbol()).to.equal(symbol);
//         });

//         it("Should have the correct version", async () => {
//           expect(await donorRewards.version()).to.equal(version);
//         });

//     });

//     describe("Minting", () => {

//         it("Should Increase Total Supply When Minting", async () => {
//             expect(await donorRewards.totalSupply()).to.equal(0);
//             await donorRewards.connect(daoExecutor).safeMint(
//                 donor1.address,
//                 "http://base1.uri/"
//             );
//             await donorRewards.connect(daoExecutor).safeMint(
//                 donor2.address,
//                 "http://base2.uri/"
//             );
//             await donorRewards.connect(daoExecutor).safeMint(
//                 donor3.address,
//                 "http://base3.uri/"
//             );
//             expect(await donorRewards.totalSupply()).to.equal(3);
//         });

//         it("Should have the correct tokenURIs", async () => {
//             expect(await donorRewards.tokenURI(BigNumber.from(0))).to.equal("http://base1.uri/");
//             expect(await donorRewards.tokenURI(BigNumber.from(1))).to.equal("http://base2.uri/");
//             expect(await donorRewards.tokenURI(BigNumber.from(2))).to.equal("http://base3.uri/");
//         });

//         it("Should update the tokenURI if necessary", async () => {
//             await donorRewards.connect(daoExecutor).updateTokenURI(BigNumber.from(0), "http://base0.uri/");
//             expect(await donorRewards.tokenURI(BigNumber.from(0))).to.equal("http://base0.uri/");
//         });

//         it("Should revert if token does not exist", async () => {
//             await expect(donorRewards.tokenURI(BigNumber.from(9001))).to.be.reverted;
//         });

//     });

//     describe("AccessControl", () => {

//         it("Should revert if not CrowdfundingCampaign contract or admin", async () => {
//             await expect(donorRewards.connect(donor1).safeMint(donor1.address, "http://base9001.uri/")).to.be.reverted;
//             await expect(donorRewards.connect(donor1).pause()).to.be.reverted;
//             await expect(donorRewards.connect(donor1).unpause()).to.be.reverted;
//         });

//         it("Should pause and successfully block all functions with whenNotPaused", async () => {
//             await donorRewards.connect(daoExecutor).pause();
//             expect(await donorRewards.paused()).to.equal(true);
//             await expect(donorRewards.connect(daoExecutor).safeMint(donor1.address, "http://base9001.uri/")).to.be.reverted;
//             await expect(donorRewards.connect(daoExecutor).updateTokenURI(BigNumber.from(0), "http://base0.uri/")).to.be.reverted;
//             await expect(donorRewards.connect(daoExecutor).pause()).to.be.reverted;
//         });

//         it("Should unpause", async () => {
//             await donorRewards.connect(daoExecutor).unpause();
//             expect(await donorRewards.paused()).to.equal(false);
//         });

//     });

//     describe('ERC721Votes', async () => {
//         const NFT0 = BigNumber.from('10000000000000000000000000');
//         const NFT1 = BigNumber.from('10');
//         const NFT2 = BigNumber.from('20');
//         const NFT3 = BigNumber.from('30');

//         let account1Votes: any;
//         let account2Votes: any;

//         describe('balanceOf', () => {

//           // before(async () => {
//           //   const [ daoExecutor, account1, account2, account1Delegatee, other1, other2 ] = await ethers.getSigners();

//           //   DonorRewards = await ethers.getContractFactory("HuntCrowdfunding");
//           //   donorRewards = await DonorRewards.deploy();
            
//           //   DonorRewards = await ethers.getContractFactory("DonorRewardsNFT");
//           //   donorRewards = await DonorRewards.deploy();
//           //   donorRewards.initialize()
//           // });
          
//           beforeEach(async function () {
//             await donorRewards.safeMint(account1.address, NFT0);
//             await donorRewards.safeMint(account1.address, NFT1);
//             await donorRewards.safeMint(account1.address, NFT2);
//             await donorRewards.safeMint(account1.address, NFT3);
//           });
      
//           it('grants to initial account', async () => {
//             expect(await donorRewards.balanceOf(account1.address)).should.equal(BigNumber.from('4'));
//           });

//           it('sets nft owner votingUnits to 1', async () => {
//             expect(await donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('1'));
//           });

//           it('sets nft non-owner votingUnits to 0', async () => {
//             expect(await donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));
//           });
//         });
      
//         describe('transfers', () => {
        
//           // before(async () => {
//           //   const [ daoExecutor, account1, account2, account1Delegatee, other1, other2 ] = await ethers.getSigners();
//           //   DonorRewards = await ethers.getContractFactory("DonorRewardsNFT");
//           //   donorRewards = await DonorRewards.deploy(daoExecutor.address);
//           // });

//           beforeEach(async () => {
//             await donorRewards.safeMint(account1.address, NFT0);
//           });
      
//           it('no delegation', async () => {

//             const { receipt } = await donorRewards.connect(account1).transferFrom(account1.address, account2.address, NFT0);

//             expectEvent(receipt, 'Transfer', { from: account1.address, to: account2.address, tokenId: NFT0 });
//             expectEvent.notEmitted(receipt, 'DelegateVotesChanged');

//             account1Votes = '0';
//             account2Votes = '0';
            
//           });
      
//           it('sender delegation', async () => {            
//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
            
//             await donorRewards.connect(account1).delegate(account1.address);

//             expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('1'));
      
//             const { receipt } = await donorRewards.connect(account1).transferFrom(account1.address, account2.address, NFT0);
//             expectEvent(receipt, 'Transfer', { from: account1.address, to: account2.address, tokenId: NFT0 });
//             expectEvent(receipt, 'DelegateVotesChanged', { delegate: account1.address, previousBalance: '1', newBalance: '0' });
      
//             const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//             expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);

//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));

//             account1Votes = '0';
//             account2Votes = '0';
            
//           });
      
//           it('receiver delegation', async () => {
//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));
            
//             await donorRewards.connect(account2).delegate(account2.address);
      
//             expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('1'));

//             const { receipt } = await donorRewards.connect(account1).transferFrom(account1.address, account2.address, NFT0);
//             expectEvent(receipt, 'Transfer', { from: account1.address, to: account2.address, tokenId: NFT0 });
//             expectEvent(receipt, 'DelegateVotesChanged', { delegate: account2.address, previousBalance: '0', newBalance: '1' });
      
//             const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//             expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);

//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));

//             account1Votes = '0';
//             account2Votes = '0';
            
//           });
      
//           it('full delegation', async () => {
//             await donorRewards.safeMint(account2.address, NFT1);
            
//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));

//             await donorRewards.connect(account1).delegate(account1.address);
//             await donorRewards.connect(account2).delegate(account2.address);
      
//             expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('1'));
//             expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('1'));

//             const { receipt } = await donorRewards.connect(account1).transferFrom(account1.address, account2.address, NFT0);
//             expectEvent(receipt, 'Transfer', { from: account1.address, to: account2.address, tokenId: NFT0 });
//             expectEvent(receipt, 'DelegateVotesChanged', { delegate: account1.address, previousBalance: '1', newBalance: '0'});
//             expectEvent(receipt, 'DelegateVotesChanged', { delegate: account2.address, previousBalance: '0', newBalance: '1' });
      
//             const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//             expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);
      
//             // expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('1'));
            
//             account1Votes = '0';
//             account2Votes = '1';
            
//           });
      
//           it('returns the same total supply on transfers', async () => {
//             // expect(await donorRewards.balanceOf(account1.address.address)).to.equal(BigNumber.from('1'));
//             // expect(await donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.balanceOf(account2.address)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.getVotingUnits(account2.address)).to.equal(BigNumber.from('0'));
            
//             await donorRewards.connect(account1).delegate(account1.address);

//             expect(donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('1'));
      
//             const { receipt } = await donorRewards.connect(account1).transferFrom(account1.address, account2.address, NFT0);

//             // expect(await donorRewards.balanceOf(account1.address.address)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.balanceOf(account2.address)).to.equal(BigNumber.from('1'));
//             // expect(await donorRewards.getVotingUnits(account1.address)).to.equal(BigNumber.from('0'));
      
//             await time.advanceBlock();
//             await time.advanceBlock();
      
//             expect(await donorRewards.getPastTotalSupply(receipt.blockNumber - 1)).to.equal(BigNumber.from('1'));
//             expect(await donorRewards.getPastTotalSupply(receipt.blockNumber + 1)).to.equal(BigNumber.from('1'));
      
//             expect(await donorRewards.getPastNumVotes(receipt.blockNumber - 1)).to.equal(BigNumber.from('1'));
//             expect(await donorRewards.getPastNumVotes(receipt.blockNumber + 1)).to.equal(BigNumber.from('1'));

//             // expect(await donorRewards.getPastVotes(account1, receipt.blockNumber - 1)).to.equal(BigNumber.from('1'));
//             // expect(await donorRewards.getPastVotes(account1, receipt.blockNumber + 1)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.getPastVotes(account2, receipt.blockNumber - 0)).to.equal(BigNumber.from('0'));
//             // expect(await donorRewards.getPastVotes(account2, receipt.blockNumber + 1)).to.equal(BigNumber.from('0'));
            
//             account1Votes = '0';
//             account2Votes = '0';
            
//           });
      
//           it('generally returns the voting balance at the appropriate checkpoint', async () => {
//             await donorRewards.safeMint(account1.address, NFT1);
//             await donorRewards.safeMint(account1.address, NFT2);
//             await donorRewards.safeMint(account1.address, NFT3);
      
//             const total = await donorRewards.balanceOf(account1.address);
      
//             const t1 = await donorRewards.connect(other1).delegate(other1.address);
//             await time.advanceBlock();
//             await time.advanceBlock();
//             const t2 = await donorRewards.connect(account1).transferFrom(account1.address, other2.address, NFT0);
//             await time.advanceBlock();
//             await time.advanceBlock();
//             const t3 = await donorRewards.connect(account1).transferFrom(account1.address, other2.address, NFT2);
//             await time.advanceBlock();
//             await time.advanceBlock();
//             const t4 = await donorRewards.connect(other2).transferFrom(other2.address, account1.address, NFT2);
//             await time.advanceBlock();
//             await time.advanceBlock();
      
//             expect(await donorRewards.getPastVotes(other1.address, t1.receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));
//             expect(await donorRewards.getPastVotes(other1.address, t1.receipt.blockNumber)).to.equal(BigNumber.from(total));
//             expect(await donorRewards.getPastVotes(other1.address, t1.receipt.blockNumber + 1)).to.equal(BigNumber.from(total));
//             expect(await donorRewards.getPastVotes(other1.address, t2.receipt.blockNumber)).to.equal(BigNumber.from('3'));
//             expect(await donorRewards.getPastVotes(other1.address, t2.receipt.blockNumber + 1)).to.equal(BigNumber.from('3'));
//             expect(await donorRewards.getPastVotes(other1.address, t3.receipt.blockNumber)).to.equal(BigNumber.from('2'));
//             expect(await donorRewards.getPastVotes(other1.address, t3.receipt.blockNumber + 1)).to.equal(BigNumber.from('2'));
//             expect(await donorRewards.getPastVotes(other1.address, t4.receipt.blockNumber)).to.equal(BigNumber.from('3'));
//             expect(await donorRewards.getPastVotes(other1.address, t4.receipt.blockNumber + 1)).to.equal(BigNumber.from('3'));
      
//             account1Votes = '0';
//             account2Votes = '0';
            
//           });
      
//           afterEach(async () => {
//             expect(await donorRewards.getVotes(account1.address)).to.equal(BigNumber.from(account1Votes));
//             expect(await donorRewards.getVotes(account2.address)).to.equal(BigNumber.from(account2Votes));
     
//             // need to advance 2 blocks to see the effect of a transfer on "getPastVotes"
//             const blockNumber = await time.latestBlock();
//             await time.advanceBlock();
            
//             expect(await donorRewards.getPastVotes(account1.address, blockNumber)).to.equal(BigNumber.from(account1Votes));
//             expect(await donorRewards.getPastVotes(account2.address, blockNumber)).to.equal(BigNumber.from(account2Votes));
//           });
//         });
      
//         // context('Voting workflow', () => {
//         //   let name;
          
//         //   beforeEach(async function () {
//         //     name = 'My Vote';
//         //   });
      
//         //   shouldBehaveLikeVotes();
//         // });
//     });
// });
