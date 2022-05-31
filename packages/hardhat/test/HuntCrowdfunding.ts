// import { formatEther, parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

import { expect } from "./chai-setup";

describe("HuntCrowdfunding contract", function () {

    let Crowdfunding: ContractFactory;
    let Vault: ContractFactory;
    let crowdfunding: Contract;
    let vault: Contract;
    let daoTreasury: SignerWithAddress;
    let owner: SignerWithAddress;
    let beneficiary: SignerWithAddress;
    let donor1: SignerWithAddress;
    let donor2: SignerWithAddress;
    let donor3: SignerWithAddress;
    let addrs: SignerWithAddress[];

    const maxFunding = ethers.utils.parseEther("2");

    before(async function () {
        [owner, daoTreasury, beneficiary, donor1, donor2, donor3, ...addrs] = await ethers.getSigners();

        Crowdfunding = await ethers.getContractFactory("HuntCrowdfunding");
        Vault = await ethers.getContractFactory("InvestigationsVault");

        crowdfunding = await Crowdfunding.deploy();
        crowdfunding.initialize(
            maxFunding, 
            beneficiary.address,
            daoTreasury.address
        );

        const vaultAddr = await crowdfunding.getVaultAddress();
        vault = Vault.attach(vaultAddr); 
    });

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            expect(await crowdfunding.owner()).to.equal(owner.address);
        });
        
        it("Should set the right maximum funding", async function () {
            expect(await crowdfunding.maximumFunding()).to.equal(ethers.utils.parseEther("2.0"));
        });

        it("Should set the right beneficiary", async function () {
            expect(await vault.beneficiaryAdmin()).to.equal(beneficiary.address);
        });

        it("Should show vault balance is 0", async function () {
            expect(await vault.connect(beneficiary).getBalance()).to.equal(BigNumber.from(0));
        });

        it("Should show 0 contributors", async function () {
            expect(await crowdfunding.getNumberOfDonors()).to.equal(BigNumber.from(0));
        });

    });

    describe("Donations", function () {

        it("Should accept ether sent without a specific function", async function () {
            await donor1.sendTransaction({ value: ethers.utils.parseEther("0.25"), to: crowdfunding.address });
            expect(await crowdfunding.getNumberOfDonors()).to.equal(BigNumber.from(1));
            expect(await crowdfunding.getDonorContribution(donor1.address)).to.equal(ethers.utils.parseEther("0.25"));
            expect(await vault.connect(beneficiary).getBalance()).to.equal(ethers.utils.parseEther("0.25"));
        });

        it("Should accept ether sent via the donate function", async function () {
            await crowdfunding.connect(donor2).donate({ value: ethers.utils.parseEther("0.25") })
            expect(await crowdfunding.getNumberOfDonors()).to.equal(BigNumber.from(2));
            expect(await crowdfunding.getDonorContribution(donor2.address)).to.equal(ethers.utils.parseEther("0.25"));
            expect(await vault.connect(beneficiary).getBalance()).to.equal(ethers.utils.parseEther("0.5"));

        });
    });

    describe("End of Campaign", function () {

        it("Should finalize the campaign when the maximumFunding value is reached", async function () {
            await crowdfunding.connect(donor3).donate({ value: ethers.utils.parseEther("1.5") })
            expect(await crowdfunding.getNumberOfDonors()).to.equal(BigNumber.from(3));
            expect(await crowdfunding.getDonorContribution(donor3.address)).to.equal(ethers.utils.parseEther("1.5"));
            expect(await vault.connect(beneficiary).getBalance()).to.equal(ethers.utils.parseEther("2.0"));
        });

        it("Should revert when campaign is over", async function () {
            await expect(crowdfunding.connect(addrs[0]).donate({ value: ethers.utils.parseEther("0.1") })).to.be.reverted;
        });

    });
});
