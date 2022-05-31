// import { expect } from "../chai-setup";
// import { BigNumber, Contract, ContractFactory} from 'ethers';
// import { ethers } from 'hardhat';

// const { constants, expectEvent, time } = require('@openzeppelin/test-helpers');
// const { MAX_UINT256, ZERO_ADDRESS } = constants;

// import { fromRpcSig } from 'ethereumjs-util';
// const ethSigUtil = require('eth-sig-util');
// import Wallet from 'ethereumjs-wallet'

// import { promisify } from 'util';
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { network } from "hardhat";
// import { Receipt } from "hardhat-deploy/types";
// import { TransactionResponse } from "@ethersproject/abstract-provider";
// const queue = promisify(setImmediate);

// const { EIP712Domain, domainSeparator } = require('../helpers/eip712');

// const Delegation = [
//   { name: 'delegatee', type: 'address' },
//   { name: 'nonce', type: 'uint256' },
//   { name: 'expiry', type: 'uint256' },
// ];

// async function countPendingTransactions() {
//   return parseInt(
//     await network.provider.send('eth_getBlockTransactionCountByNumber', ['pending'])
//   );
// }

// async function batchInBlock (txs) {
//   try {
//     // disable auto-mining
//     await network.provider.send('evm_setAutomine', [false]);
//     // send all transactions
//     const promises = txs.map(fn => fn());
//     // wait for node to have all pending transactions
//     while (txs.length > await countPendingTransactions()) {
//       await queue();
//     }
//     // mine one block
//     await network.provider.send('evm_mine');
//     // fetch receipts
//     const receipts = await Promise.all(promises);
//     // Sanity check, all tx should be in the same block
//     const minedBlocks = new Set(receipts.map(({ receipt }) => receipt.blockNumber));
//     expect(minedBlocks.size).to.equal(1);

//     return receipts;
//   } finally {
//     // enable auto-mining
//     await network.provider.send('evm_setAutomine', [true]);
//   }
// }

// describe('HuntToken', function () {
//   let owner: SignerWithAddress;
//   let holder: SignerWithAddress;
//   let recipient: SignerWithAddress;
//   let holderDelegatee: SignerWithAddress;
//   let recipientDelegatee: SignerWithAddress;
//   let other1: SignerWithAddress;
//   let other2: SignerWithAddress;
//   let other3: SignerWithAddress;
//   let Hunt: ContractFactory;
//   let hunt: Contract;
  
//   const name: string = 'HuntToken';
//   const symbol: string = 'HUNT';
//   const version: string = '0.2.1';

//   let t1: any;
//   let t2: any;
//   let t3: any;
//   let t4: any;

//   const supply: BigNumber = BigNumber.from('1000000000000000000');
//   const maxSupply: BigNumber = BigNumber.from('1000000000000000000000000000');
//   const initialSupply = BigNumber.from('50000');
//   const amount0 = BigNumber.from('50000');
//   const amount1 = BigNumber.from('10000');
//   const nTokens = BigNumber.from('100');


//   beforeEach(async function () {
//     [ owner, holder, recipient, holderDelegatee, recipientDelegatee, other1, other2, other3 ] = await ethers.getSigners();

//     Hunt = await ethers.getContractFactory("HuntToken");
//     hunt = await Hunt.deploy();
//     hunt.__HuntToken_init(name, symbol, initialSupply, maxSupply, nTokens, holder.address);
//   });

//   describe('fixed supply', function () {

//     it('deployer has the balance equal to initial supply', async function () {
//       expect(await hunt.balanceOf(holder.address)).to.equal(BigNumber.from(initialSupply));
//     });

//     it('total supply is equal to initial supply', async function () {
//       expect(await hunt.totalSupply()).to.equal(BigNumber.from(initialSupply));
//     });

//     describe('burning', function () {

//       it('holders can burn their tokens', async function () {
//         const remainingBalance = initialSupply.sub(amount1);
//         const receipt = await hunt.burn(amount1);
//         expectEvent(receipt, 'Transfer', { from: owner.address, to: ZERO_ADDRESS, value: amount1 });
//         expect(await hunt.balanceOf(owner.address)).to.equal(BigNumber.from(remainingBalance));
//       });

//       it('decrements totalSupply', async function () {
//         const expectedSupply = initialSupply.sub(amount1);
//         expect(await hunt.totalSupply()).to.equal(BigNumber.from(expectedSupply));
//       });

//     });
    
//   });

//   // describe('timelock', function () {
//   //   let beneficiary: SignerWithAddress;

//   //   const amount1 = BigNumber.from(100);

//   //   let Timelock: ContractFactory;
//   //   let timelock: Contract;

//   //   let releaseTime: BigNumber;

//   //   before(async() => {
//   //     [owner, beneficiary] = await ethers.getSigners();
//   //     Timelock = await ethers.getContractFactory("TokenTimelock");
//   //   })

//   //   beforeEach(async () => {
//   //     hunt = await Hunt.deploy(name, symbol, beneficiary, 0); 
//   //   });

//   //   it('rejects a release time in the past', async function () {
//   //     const pastReleaseTime = (await time.latest()).sub(time.duration.years(1));
//   //     await expect(Timelock.deploy(hunt.address, beneficiary, pastReleaseTime)).to.be.revertedWith('Hunt: release time is before current time');
//   //   });

//   //   context('once deployed', function () {
//   //     beforeEach(async function () {
//   //       releaseTime = (await time.latest()).add(time.duration.years(1));
//   //       timelock = await Hunt.deploy(hunt.address, beneficiary, releaseTime);
//   //       await hunt.mint(timelock.address, amount1);
//   //     });

//   //     it('can get state', async function () {
//   //       expect(await timelock.token()).to.equal(hunt.address);
//   //       expect(await timelock.beneficiary()).to.equal(beneficiary);
//   //       expect(await timelock.releaseTime()).to.equal(BigNumber.from(releaseTime));
//   //     });

//   //     it('cannot be released before time limit', async function () {
//   //       await expect(timelock.release()).to.be.revertedWith('TokenTimelock: current time is before release time');
//   //     });

//   //     it('cannot be released just before time limit', async function () {
//   //       await time.increaseTo(releaseTime.sub(time.duration.seconds(3)));
//   //       await expect(timelock.release()).to.be.revertedWith('TokenTimelock: current time is before release time');
//   //     });

//   //     it('can be released just after limit', async function () {
//   //       await time.increaseTo(releaseTime.add(time.duration.seconds(1)));
//   //       await timelock.release();
//   //       expect(await hunt.balanceOf(beneficiary)).to.equal(BigNumber.from(amount1));
//   //     });

//   //     it('can be released after time limit', async function () {
//   //       await time.increaseTo(releaseTime.add(time.duration.years(1)));
//   //       await timelock.release();
//   //       expect(await hunt.balanceOf(beneficiary)).to.equal(BigNumber.from(amount1));
//   //     });

//   //     it('cannot be released twice', async function () {
//   //       await time.increaseTo(releaseTime.add(time.duration.years(1)));
//   //       await timelock.release();
//   //       await expect(timelock.release()).to.be.revertedWith('TokenTimelock: no tokens to release');
//   //       expect(await hunt.balanceOf(beneficiary)).to.equal(BigNumber.from(amount1));
//   //     });
//   //   });
//   // });

//   // context('pausable token', function () {
//   //   const [ holder, recipient, anotherAccount ] = accounts;

//   //   beforeEach(async function () {
//   //     hunt = await Hunt.new(name, symbol, holder, initialSupply);
//   //   });

//   //   describe('transfer', function () {
//   //     it('allows to transfer when unpaused', async function () {
//   //       await hunt.transfer(recipient, initialSupply);

//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from('0'));
//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(initialSupply);
//   //     });

//   //     it('allows to transfer when paused and then unpaused', async function () {
//   //       await hunt.pause();
//   //       await hunt.unpause();

//   //       await hunt.transfer(recipient, initialSupply);

//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from('0'));
//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(initialSupply);
//   //     });

//   //     it('reverts when trying to transfer when paused', async function () {
//   //       await hunt.pause();

//   //       await expectRevert(hunt.transfer(recipient, initialSupply),
//   //         'ERC20Pausable: token transfer while paused',
//   //       );
//   //     });
//   //   });

//   //   describe('transfer from', function () {
//   //     const allowance = BigNumber.from(40);

//   //     beforeEach(async function () {
//   //       await hunt.approve(anotherAccount, allowance);
//   //     });

//   //     it('allows to transfer from when unpaused', async function () {
//   //       await hunt.transferFrom(holder, recipient, allowance, { from: anotherAccount });

//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(allowance);
//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from(initialSupply.sub(allowance));
//   //     });

//   //     it('allows to transfer when paused and then unpaused', async function () {
//   //       await hunt.pause();
//   //       await hunt.unpause();

//   //       await hunt.transferFrom(holder, recipient, allowance, { from: anotherAccount });

//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(allowance);
//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from(initialSupply.sub(allowance));
//   //     });

//   //     it('reverts when trying to transfer from when paused', async function () {
//   //       await hunt.pause();

//   //       await expectRevert(hunt.transferFrom(
//   //         holder, recipient, allowance, { from: anotherAccount }), 'ERC20Pausable: token transfer while paused',
//   //       );
//   //     });
//   //   });

//   //   describe('mint', function () {
//   //     const amount1 = BigNumber.from('42');

//   //     it('allows to mint when unpaused', async function () {
//   //       await hunt.mint(recipient, amount1);

//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(amount1));
//   //     });

//   //     it('allows to mint when paused and then unpaused', async function () {
//   //       await hunt.pause();
//   //       await hunt.unpause();

//   //       await hunt.mint(recipient, amount1);

//   //       expect(await hunt.balanceOf(recipient)).to.equal(BigNumber.from(amount1));
//   //     });

//   //     it('reverts when trying to mint when paused', async function () {
//   //       await hunt.pause();

//   //       await expectRevert(hunt.mint(recipient, amount1),
//   //         'ERC20Pausable: token transfer while paused',
//   //       );
//   //     });
//   //   });

//   //   describe('burn', function () {
//   //     const amount1 = BigNumber.from('42');

//   //     it('allows to burn when unpaused', async function () {
//   //       await hunt.burn(holder, amount1);

//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from(initialSupply.sub(amount1));
//   //     });

//   //     it('allows to burn when paused and then unpaused', async function () {
//   //       await hunt.pause();
//   //       await hunt.unpause();

//   //       await hunt.burn(holder, amount1);

//   //       expect(await hunt.balanceOf(holder)).to.equal(BigNumber.from(initialSupply.sub(amount1));
//   //     });

//   //     it('reverts when trying to burn when paused', async function () {
//   //       await hunt.pause();

//   //       await expectRevert(hunt.burn(holder, amount1),
//   //         'ERC20Pausable: token transfer while paused',
//   //       );
//   //     });
//   //   });
//   // });

//   describe('voting', function () {

//     // before(async () => {
//     //   [ holder, recipient, holderDelegatee, recipientDelegatee, other1, other2, other3 ] = await ethers.getSigners();
//     //   Hunt = await ethers.getContractFactory("HuntToken");
//     //   hunt = await Hunt.deploy();
//     //   hunt.initialize(name, symbol, initialSupply, owner.address);
//     // });

//     it('initial nonce is 0', async function () {
//       expect(await hunt.nonces(holder.address)).to.equal(BigNumber.from('0'));
//     });

//     it('minting restriction', async function () {
//       const amount1 = BigNumber.from('2').pow(BigNumber.from('224'));
//       await expect(hunt.mint(holder.address, amount1)).to.be.revertedWith('ERC20Votes: total supply risks overflowing votes');
//     });

//     describe('set delegation', function () {

//       // before(async () => {
//       //   [ holder, recipient, holderDelegatee, recipientDelegatee, other1, other2, other3 ] = await ethers.getSigners();
//       //   Hunt = await ethers.getContractFactory("HuntToken");
//       //   hunt = await Hunt.deploy();
//       //   hunt.initialize(name, symbol, initialSupply, owner.address);
//       // });
      
//       describe('call', function () {
        
//         it('delegation with balance', async function () {

//           await hunt.mint(holder, amount1);
          
//           expect(await hunt.delegates(holder.address)).to.be.equal(ZERO_ADDRESS);

//           const { receipt } = await hunt.connect(holder).delegate(holder.address);

//           expectEvent(receipt, 'DelegateChanged', {
//             delegator: holder.address,
//             fromDelegate: ZERO_ADDRESS,
//             toDelegate: holder.address,
//           });
//           expectEvent(receipt, 'DelegateVotesChanged', {
//             delegate: holder.address,
//             previousBalance: '0',
//             newBalance: amount1,
//           });

//           expect(await hunt.delegates(holder.address)).to.be.equal(holder.address);
//           expect(await hunt.getVotes(holder.address)).to.equal(BigNumber.from('1'));

//           expect(await hunt.getPastVotes(holder, receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));

//           await time.advanceBlock();

//           expect(await hunt.getPastVotes(holder, receipt.blockNumber)).to.equal(BigNumber.from('1'));
          
//         });

//         it('delegation without balance', async function () {
          
//           expect(await hunt.delegates(holder.address)).to.be.equal(ZERO_ADDRESS);

//           const { receipt } = await hunt.connect(holder).delegate(holder.address);
//           expectEvent(receipt, 'DelegateChanged', {
//             delegator: holder.address,
//             fromDelegate: ZERO_ADDRESS,
//             toDelegate: holder.address,
//           });
//           expectEvent.notEmitted(receipt, 'DelegateVotesChanged');

//           expect(await hunt.delegates(holder.address)).to.be.equal(holder.address);
//           expect(await hunt.getVotes(holder.address)).to.be.equal(BigNumber.from('0'));
          
//         });
//       });

//       // describe('with signature', function () {
//       //   const delegator = Wallet.generate();
//       //   const delegatorAddress = ethers.utils.getAddress(delegator.getAddressString());
//       //   const nonce = 0;

//       //   // const buildData = (chainId, verifyingContract, message) => ({ data: {
//       //   //   primaryType: 'Delegation',
//       //   //   types: { EIP712Domain, Delegation },
//       //   //   domain: { name, version, chainId, verifyingContract },
//       //   //   message,
//       //   // }});

//       //   beforeEach(async function () {
//       //     await hunt.mint(delegatorAddress, supply);
//       //   });

//       //   it('accept signed delegation', async function () {
//       //     const { v, r, s } = fromRpcSig(ethSigUtil.signTypedMessage(
//       //       delegator.getPrivateKey(),
//       //       buildData(chainId, hunt.address, {
//       //         delegatee: delegatorAddress,
//       //         nonce,
//       //         expiry: MAX_UINT256,
//       //       }),
//       //     ));

//       //     expect(await hunt.delegates(delegatorAddress)).to.be.equal(ZERO_ADDRESS);

//       //     const { receipt } = await hunt.delegateBySig(delegatorAddress, nonce, MAX_UINT256, v, r, s);
//       //     expectEvent(receipt, 'DelegateChanged', {
//       //       delegator: delegatorAddress,
//       //       fromDelegate: ZERO_ADDRESS,
//       //       toDelegate: delegatorAddress,
//       //     });
//       //     expectEvent(receipt, 'DelegateVotesChanged', {
//       //       delegate: delegatorAddress,
//       //       previousBalance: '0',
//       //       newBalance: supply,
//       //     });

//       //     expect(await hunt.delegates(delegatorAddress)).to.be.equal(delegatorAddress);
//       //     expect(await hunt.getVotes(delegatorAddress)).to.equal(BigNumber.from(1));

//       //     expect(await hunt.getPastVotes(delegatorAddress, receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));

//       //     await time.advanceBlock();

//       //     expect(await hunt.getPastVotes(delegatorAddress, receipt.blockNumber)).to.equal(BigNumber.from('1'));
//       //   });

//       //   it('rejects reused signature', async function () {
//       //     const { v, r, s } = fromRpcSig(ethSigUtil.signTypedMessage(
//       //       delegator.getPrivateKey(),
//       //       buildData(chainId, hunt.address, {
//       //         delegatee: delegatorAddress,
//       //         nonce,
//       //         expiry: MAX_UINT256,
//       //       }),
//       //     ));

//       //     await hunt.delegateBySig(delegatorAddress, nonce, MAX_UINT256, v, r, s);

//       //     await expect(hunt.delegateBySig(delegatorAddress, nonce, MAX_UINT256, v, r, s)).to.be.revertedWith('ERC20Votes: invalid nonce');
//       //   });

//       //   it('rejects bad delegatee', async function () {
//       //     const { v, r, s } = fromRpcSig(ethSigUtil.signTypedMessage(
//       //       delegator.getPrivateKey(),
//       //       buildData(chainId, hunt.address, {
//       //         delegatee: delegatorAddress,
//       //         nonce,
//       //         expiry: MAX_UINT256,
//       //       }),
//       //     ));

//       //     const receipt = await hunt.delegateBySig(holderDelegatee.address, nonce, MAX_UINT256, v, r, s);
//       //     const { args } = receipt.logs.find(({ event }) => event == 'DelegateChanged');
//       //     expect(args.delegator).to.not.be.equal(delegatorAddress);
//       //     expect(args.fromDelegate).to.be.equal(ZERO_ADDRESS);
//       //     expect(args.toDelegate).to.be.equal(holderDelegatee.address);
//       //   });

//       //   it('rejects bad nonce', async function () {
//       //     const { v, r, s } = fromRpcSig(ethSigUtil.signTypedMessage(
//       //       delegator.getPrivateKey(),
//       //       buildData(chainId, hunt.address, {
//       //         delegatee: delegatorAddress,
//       //         nonce,
//       //         expiry: MAX_UINT256,
//       //       }),
//       //     ));
//       //     await expect(hunt.delegateBySig(delegatorAddress, nonce + 1, MAX_UINT256, v, r, s)).to.be.revertedWith('ERC20Votes: invalid nonce');
//       //   });

//       //   it('rejects expired permit', async function () {
//       //     const expiry = (await time.latest()) - time.duration.weeks(1);
//       //     const { v, r, s } = fromRpcSig(ethSigUtil.signTypedMessage(
//       //       delegator.getPrivateKey(),
//       //       buildData(chainId, hunt.address, {
//       //         delegatee: delegatorAddress,
//       //         nonce,
//       //         expiry,
//       //       }),
//       //     ));

//       //     await expect(hunt.delegateBySig(delegatorAddress, nonce, expiry, v, r, s)).to.be.revertedWith('ERC20Votes: signature expired');
//       //   });
//       // });

//     });

//     describe('change delegation', function () {
      
//       // before(async () => {
//       //   [ holder, recipient, holderDelegatee, recipientDelegatee, other1, other2, other3 ] = await ethers.getSigners();
//       //   Hunt = await ethers.getContractFactory("HuntToken");
//       //   hunt = await Hunt.deploy();
//       //   hunt.initialize(name, symbol, initialSupply, owner.address);
//       // });
      
//       beforeEach(async function () {
//         await hunt.mint(holder.address, amount1);
//         await hunt.connect(holder).delegate(holder.address);
//       });

//       it('call', async function () {
        
//         expect(await hunt.delegates(holder)).to.be.equal(holder);

//         const { receipt } = await hunt.connect(holder).delegate(holderDelegatee.address);
        
//         expectEvent(receipt, 'DelegateChanged', {
//           delegator: holder.address,
//           fromDelegate: holder.address,
//           toDelegate: holderDelegatee.address,
//         });
//         expectEvent(receipt, 'DelegateVotesChanged', {
//           delegate: holder.address,
//           previousBalance: amount1,
//           newBalance: '0',
//         });
//         expectEvent(receipt, 'DelegateVotesChanged', {
//           delegate: holderDelegatee.address,
//           previousBalance: '0',
//           newBalance: amount1,
//         });

//         expect(await hunt.delegates(holder.address)).to.be.equal(holderDelegatee.address);

//         expect(await hunt.getVotes(holder.address)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getVotes(holderDelegatee.address)).to.equal(BigNumber.from('1'));
        
//         expect(await hunt.getPastVotes(holder.address, receipt.blockNumber - 1)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastVotes(holderDelegatee.address, receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));

//         await time.advanceBlock();

//         expect(await hunt.getPastVotes(holder.address, receipt.blockNumber)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastVotes(holderDelegatee.address, receipt.blockNumber)).to.equal(BigNumber.from('1'));
        
//       });
      
//     });

//     describe('transfers', function () {

//       let holderVotes: string | BigNumber;
//       let recipientVotes: string | BigNumber;
//       let otherVotes: string | BigNumber;

//       beforeEach(async function () {
//         await hunt.mint(holder.address, amount1);
//       });

//       it('no delegation', async function () {
        
//         const { receipt } = await hunt.connect(holder).transfer(recipient.address, BigNumber.from('1'));
        
//         expectEvent(receipt, 'Transfer', { from: holder.address, to: recipient.address, value: '1' });
//         expectEvent.notEmitted(receipt.address, 'DelegateVotesChanged');

//         holderVotes = '0';
//         recipientVotes = '0';
        
//       });

//       it('sender delegation', async function () {
        
//         await hunt.connect(holder).delegate(holder.address);

//         const { receipt } = await hunt.connect(holder).transfer(recipient.address, 1);
        
//         expectEvent(receipt, 'Transfer', { from: holder.address, to: recipient.address, value: '1' });
//         expectEvent(receipt, 'DelegateVotesChanged', { delegate: holder.address, previousBalance: '0', newBalance: '1' });

//         const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//         expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);

//         holderVotes = '1';
//         recipientVotes = '0';
        
//       });

//       it('receiver delegation', async function () {

//         await hunt.connect(recipient).delegate(recipient.address);

//         const { receipt } = await hunt.connect(holder).transfer(recipient.address, 1);

//         expectEvent(receipt, 'Transfer', { from: holder.address, to: recipient.address, value: '1' });
//         expectEvent(receipt, 'DelegateVotesChanged', { delegate: recipient.address, previousBalance: '0', newBalance: '1' });

//         const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//         expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);

//         holderVotes = '0';
//         recipientVotes = '1';
        
//       });

//       it('full delegation', async function () {

//         await hunt.connect(holder).delegate(holder.address);
//         await hunt.connect(recipient).delegate(holder.address);

//         const { receipt } = await hunt.connect(holder).transfer(other3.address, 5000);

//         expectEvent(receipt, 'Transfer', { from: holder.address, to: other3.address, value: '1' });
//         expectEvent(receipt, 'DelegateVotesChanged', { delegate: holder.address, previousBalance: '1', newBalance: '1' });
//         expectEvent(receipt, 'DelegateVotesChanged', { delegate: other3.address, previousBalance: '0', newBalance: '1' });

//         const { logIndex: transferLogIndex } = receipt.logs.find(({ event }) => event == 'Transfer');
//         expect(receipt.logs.filter(({ event }) => event == 'DelegateVotesChanged').every(({ logIndex }) => transferLogIndex < logIndex)).to.be.equal(true);

//         holderVotes = '1';
//         recipientVotes = '0';
//         otherVotes = '1';
//       });

//       afterEach(async function () {
        
//         expect(await hunt.getVotes(holder.address)).to.equal(BigNumber.from(holderVotes));
//         expect(await hunt.getVotes(recipient.address)).to.equal(BigNumber.from(recipientVotes));

//         // need to advance 2 blocks to see the effect of a transfer on "getPastVotes"
//         const blockNumber = await time.latestBlock();

//         await time.advanceBlock();
//         await time.advanceBlock();

//         expect(await hunt.getPastVotes(holder.address, blockNumber - 1)).to.equal(BigNumber.from(holderVotes));
//         expect(await hunt.getPastVotes(recipient.address, blockNumber - 1)).to.equal(BigNumber.from(recipientVotes));

//       });
      
//     });

//     describe('getPastTotalSupply', function () {

//       before(async function () {
//       //   [ holder, recipient, holderDelegatee, recipientDelegatee, other1, other2, other3 ] = await ethers.getSigners();
//       //   Hunt = await ethers.getContractFactory("HuntToken");
//         hunt = await Hunt.deploy();
//         hunt.__HuntToken_init(name, symbol, initialSupply, maxSupply, nTokens, owner.address);
//       });

//       beforeEach(async function () {
//         await hunt.connect(recipient).delegate(holder.address);
//       });

//       it('reverts if block number >= current block', async function () {
        
//         await expect(
//           hunt.connect(holder).getPastTotalSupply(BigNumber.from('99999999999999999999999999999999999999999999999'))
//         ).to.be.revertedWith('ERC20Votes: block not yet mined');
        
//       });

//       it('returns 0 if there are no checkpoints', async function () {
        
//         expect(await hunt.getPastTotalSupply(0)).to.equal(BigNumber.from('0'));

//       });

//       it('returns the latest block if >= last checkpoint block', async function () {

//         t1 = await hunt.mint(holder.address, amount1);

//         await time.advanceBlock();
//         await time.advanceBlock();

//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.equal(BigNumber.from(amount1));

//       });

//       it('returns zero if < first checkpoint block', async function () {

//         await time.advanceBlock();

//         const t1 = await hunt.mint(holder.address, amount1);

//         await time.advanceBlock();
//         await time.advanceBlock();

//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.equal(BigNumber.from(amount1));

//       });

//       it('generally returns the voting balance at the appropriate checkpoint', async function () {

//         const t1 = await hunt.mint(holder.address, BigNumber.from('2000'));
        
//         await time.advanceBlock();
//         await time.advanceBlock();

//         const t2 = await hunt.burn(holder.address, BigNumber.from('1000'));
        
//         await time.advanceBlock();
//         await time.advanceBlock();
        
//         const t3 = await hunt.burn(holder.address, BigNumber.from('750'));
        
//         await time.advanceBlock();
//         await time.advanceBlock();

//         const t4 = await hunt.mint(holder.address, BigNumber.from('1000'));

//         await time.advanceBlock();
//         await time.advanceBlock();

//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber - 1)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastTotalSupply(t2.receipt.blockNumber)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastTotalSupply(t2.receipt.blockNumber + 1)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastTotalSupply(t3.receipt.blockNumber)).to.equal(BigNumber.from('1'));
//         expect(await hunt.getPastTotalSupply(t3.receipt.blockNumber + 1)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastTotalSupply(t4.receipt.blockNumber)).to.equal(BigNumber.from('0'));
//         expect(await hunt.getPastTotalSupply(t4.receipt.blockNumber + 1)).to.equal(BigNumber.from('1'));

//       });

//     });
//   });
// });