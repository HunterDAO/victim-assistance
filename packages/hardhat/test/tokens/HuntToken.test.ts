import { ethers } from 'hardhat';
import { expect } from "../chai-setup";
import { BigNumber, Contract, ContractFactory} from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { constants, expectEvent, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

import { fromRpcSig } from 'ethereumjs-util';
const ethSigUtil = require('eth-sig-util');
import Wallet from 'ethereumjs-wallet'

import { promisify } from 'util';
const queue = promisify(setImmediate);

describe('ERC20', async function () {
    let initialHolder: SignerWithAddress;
    let recipient: SignerWithAddress;
    let anotherAccount: SignerWithAddress;

    [ initialHolder, recipient, anotherAccount ] = await ethers.getSigners();

    let Hunt: ContractFactory = await ethers.getContractFactory('HuntToken');
    let hunt: Contract;

    const name = 'HuntToken';
    const symbol = 'HUNT';

    let initialSupply: BigNumber = BigNumber.from('1000000000');
    let expectedSupply: any;
    let amount: any;

    beforeEach(async function () { 
        hunt = await Hunt.connect(initialHolder).deploy(); 
    });

    it('has a name', async function () {
        expect(await hunt.name()).to.equal(name);
    });

    it('has a symbol', async function () {
        expect(await hunt.symbol()).to.equal(symbol);
    });

    it('has 18 decimals', async function () {
        expect(await hunt.decimals()).to.equal(BigNumber.from('18'));
    });

    // shouldBehaveLikeERC20('ERC20', initialSupply, initialHolder.address, recipient.address, anotherAccount.address);

    describe('decrease allowance', function () {
        let tx: any;

        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            function shouldDecreaseApproval (amount: BigNumber) {
                describe('when there was no approved amount before', function () {
                    it('reverts', async function () {
                        await expect(hunt.connect(initialHolder).decreaseAllowance(spender.address, amount)).to.be.reverted;
                    });
                });

                describe('when the spender had an approved amount', function () {
                    const approvedAmount = amount;

                    beforeEach(async function () {
                        tx = await hunt.connect(initialHolder).approve(spender.address, approvedAmount);
                    });

                    it('emits an approval event', async function () {
                        tx = hunt.connect(initialHolder).decreaseAllowance(spender.address, approvedAmount);
                        await expect(tx).to.emit(hunt, 'Approval');
                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(BigNumber.from('0'));
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await hunt.connect(initialHolder).decreaseAllowance(spender.address, approvedAmount.sub(1));
                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(BigNumber.from('1'));
                    });

                    it('sets the allowance to zero when all allowance is removed', async function () {
                        await hunt.connect(initialHolder).decreaseAllowance(spender.address, approvedAmount);
                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(BigNumber.from('0'));
                    });

                    it('reverts when more than the full allowance is removed', async function () {
                        await expect(hunt.connect(initialHolder).decreaseAllowance(spender.address, approvedAmount.add('1'))).to.be.reverted;
                    });
                });
            };

            describe('when the sender has enough balance', function () {
                shouldDecreaseApproval(initialSupply);
            });

            describe('when the sender does not have enough balance', function () {
                shouldDecreaseApproval(initialSupply);
            });
        });

        describe('when the spender is the zero address', function () {
            let amount = initialSupply.sub('5000');
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await expect(hunt.connect(initialHolder).decreaseAllowance(spender.address, amount)).to.be.reverted;
            });
        });
    });

    describe('increase allowance', function () {
        let amount = BigNumber.from(initialSupply).add('5000');
        let tx: any;

        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    tx = hunt.connect(initialHolder).increaseAllowance(spender.address, amount);
                    await expect(tx).to.emit(hunt, 'Approval');
                    expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await hunt.connect(initialHolder).increaseAllowance(spender.address, amount);

                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await hunt.connect(initialHolder).approve(spender.address, BigNumber.from(1));
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await hunt.connect(initialHolder).increaseAllowance(spender.address, amount);

                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount.add(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                let amount = BigNumber.from(initialSupply).add('5000');

                it('emits an approval event', async function () {
                    tx = hunt.connect(initialHolder).increaseAllowance(spender.address, amount);
                    await expect(tx).to.emit(hunt, 'Approval')
                    expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await hunt.connect(initialHolder).increaseAllowance(spender.address, amount);

                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await hunt.connect(initialHolder).approve(spender.address, BigNumber.from(1));
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await hunt.connect(initialHolder).increaseAllowance(spender.address, amount);

                        expect(await hunt.allowance(initialHolder.address, spender.address)).to.equal(amount.add(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await expect(hunt.connect(initialHolder).increaseAllowance(spender.address, BigNumber.from(1))).to.be.reverted;
            });
        });
    });

    describe('_mint', function () {
        let amount: BigNumber;
        let tx: any;

        it('rejects a null account', async function () {
            await expect(hunt.connect(initialHolder).mint(ZERO_ADDRESS, amount)).to.be.reverted;
        });

        describe('for a non zero account', function () {
            beforeEach('minting', async function () {
                expectedSupply = initialSupply.add('5000');
                amount = BigNumber.from('5000');
                // console.log({ 
                //     initialHolder: initialHolder.address,
                //     recipient: recipient.address,
                //     anotherAccount: anotherAccount.address,
                //     hunt: hunt.address
                // });
                tx = hunt.connect(initialHolder).mint(initialHolder.address, initialSupply);
                tx = hunt.connect(initialHolder).mint(recipient.address, amount);
            });

            it('increments totalSupply', async function () {
                expect(await hunt.totalSupply()).to.equal(expectedSupply);
            });

            it('increments recipient balance', async function () {
                expect(await hunt.balanceOf(recipient.address)).to.equal(amount);
            });

            it('emits Transfer event', async function () {
                await expect(tx).to.emit(hunt, 'Transfer');
            });
        });
    });

    describe('_burn', function () {
        let amount = BigNumber.from('5000')
        let tx: any;

        describe('for a non zero account', function () {
            it('rejects burning more than balance', async function () {
                await expect(hunt.connect(initialHolder).burn(initialSupply.add('1'))).to.be.reverted;
            });

            const describeBurn = function (description: string, amount: BigNumber) {
                describe(description, function () {
                    beforeEach('burning', async function () {
                        tx = await hunt.connect(initialHolder).burn(amount);
                    });

                    it('decrements totalSupply', async function () {
                        const expectedSupply = initialSupply.sub(amount.toNumber());
                        expect(await hunt.totalSupply()).to.equal(expectedSupply);
                    });

                    it('decrements initialHolder balance', async function () {
                        const expectedBalance = initialSupply.sub(amount);
                        expect(await hunt.balanceOf(initialHolder.address)).to.equal(expectedBalance);
                    });

                    it('emits Transfer event', async function () {
                        await expect(tx).to.emit(hunt, 'Transfer');
                        // console.log({ value: await hunt.balanceOf(initialHolder.address) });
                        // expect(await hunt.balanceOf(initialHolder.address)).to.equal();
                    });
                });
            };

            describeBurn('for entire balance', hunt.balanceOf(initialHolder.address));
            describeBurn('for less amount than balance', hunt.balanceOf(initialHolder.address).sub('5000'));
        });
    });

    describe('_transfer', function () {
        describe('when the sender is the zero address', function () {
            it('reverts', async function () {
                await expect(hunt.connect(initialHolder).transfer(ZERO_ADDRESS, recipient.address, initialSupply.sub('5000'))).to.be.reverted;
            });
        });
    });

    describe('_approve', function () {
        it('should behave like ERC20Approve', async function () {
            return hunt.connect(initialHolder).approve(anotherAccount.address, recipient.address, initialSupply.sub('5000'));
        });

        describe('when the owner is the zero address', function () {
            it('reverts', async function () {
                await expect(hunt.connect(initialHolder).approve(ZERO_ADDRESS, recipient.address, initialSupply.sub('5000'))).to.be.reverted;
            });
        });
    });
});