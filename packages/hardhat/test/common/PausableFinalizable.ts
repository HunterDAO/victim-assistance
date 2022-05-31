// import { expect } from "../chai-setup";
// import { BigNumber, Contract, ContractFactory, Signer } from 'ethers';
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { ethers } from "hardhat";

// const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');


// // TODO: Implement Mock

// describe('PausableFinalizable', function () {
//   let pauser: SignerWithAddress;

//   let PausableFinalizable: ContractFactory;
//   let pausableFinalizable: Contract;

//   let receipt: any;

//   beforeEach(async function () {
//     [ pauser ] = await ethers.getSigners();
//     PausableFinalizable = await ethers.getContractFactory('PausableFinalizableMock');
//     pausableFinalizable = await PausableFinalizable.deploy();
//   });

//   context('when active', function () {

//     beforeEach(async function () {
//       expect(await pausableFinalizable.paused()).to.equal(false);
//     });

//     it('can perform normal process in non-pause', async function () {
//       expect(await pausableFinalizable.count()).to.equal(BigNumber.from('0'));
//       await pausableFinalizable.normalProcess();
//       expect(await pausableFinalizable.count()).to.equal(BigNumber.from('1'));
//     });

//     it('cannot take drastic measure in non-pause', async function () {
//       await expectRevert(pausableFinalizable.drasticMeasure(),
//         'PausableFinalizable: not paused',
//       );
//       expect(await pausableFinalizable.drasticMeasureTaken()).to.equal(false);
//     });

//     context('when paused and active', function () {
//       beforeEach(async function () {
//         (receipt = await pausableFinalizable.pause({ from: pauser }));
//       });

//       it('emits a Paused event', function () {
//         expectEvent(receipt, 'Paused', { account: pauser });
//       });

//       it('cannot perform normal process in pause', async function () {
//         await expectRevert(pausableFinalizable.normalProcess(), 'PausableFinalizable: paused');
//       });

//       it('can take a drastic measure in a pause', async function () {
//         await pausableFinalizable.drasticMeasure();
//         expect(await pausableFinalizable.drasticMeasureTaken()).to.equal(true);
//       });

//       it('reverts when re-pausing', async function () {
//         await expectRevert(pausableFinalizable.pause(), 'PausableFinalizable: paused');
//       });

//       describe('unpausing', function () {
//         it('reverts on all', async function () {
//           await pausableFinalizable.unpause();
//           expect(await pausableFinalizable.paused()).to.equal(false);
//         });

//         context('when unpaused and active', function () {
//           beforeEach(async function () {
//             receipt = await pausableFinalizable.unpause();
//           });

//           it('emits an Unpaused event', function () {
//             expectEvent(receipt, 'Unpaused', { account: pauser });
//           });

//           it('should resume allowing normal process', async function () {
//             expect(await pausableFinalizable.count()).to.equal(BigNumber.from('0'));
//             await pausableFinalizable.normalProcess();
//             expect(await pausableFinalizable.count()).to.equal(BigNumber.from('1'));
//           });

//           it('should prevent drastic measure', async function () {
//             await expect(pausableFinalizable.drasticMeasure()).to.be.revertedWith('PausableFinalizable: not paused');
//           });

//           it('reverts when re-unpausing', async function () {
//             await expect(pausableFinalizable.unpause()).to.be.revertedWith('PausableFinalizable: not paused');
//           });
          
//         });
//       });
//     });
//   });

//   context('when finalized', function () {

//     before(async function () {
//       await pausableFinalizable.finalize();
//     });

//     it('should return active = false', async function () {
//       expect(await pausableFinalizable.active()).to.equal(false);
//     });
      
//     it('fails to perform normal process when finalized', async function () {
//       expect(await pausableFinalizable.count()).to.equal(BigNumber.from('0'));

//       await expect(pausableFinalizable.normalProcess()).to.be.revertedWith('PausableFinalizable: finalized')
//     });

//     it('cannot take drastic measure when finalized', async function () {
//       await expect(pausableFinalizable.drasticMeasure()).to.be.revertedWith('PausableFinalizable: finalized');
//       expect(await pausableFinalizable.drasticMeasureTaken()).to.equal(false);
//     });

//   });
// });