import { formatEther, formatUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

import { expect } from "./chai-setup";

describe("Token contract", function () {

    let Crowdfunding: ContractFactory;
    let Vault: ContractFactory;
    let crowdfunding: Contract;
    let vault: Contract;
    let owner: SignerWithAddress;
    let beneficiary: SignerWithAddress;
    let donor1: SignerWithAddress;
    let addrs: SignerWithAddress[];

    before(async function () {
        [owner, beneficiary, donor1, ...addrs] = await ethers.getSigners();

        Crowdfunding = await ethers.getContractFactory("Crowdfunding");
        Vault = await ethers.getContractFactory("Vault");

        crowdfunding = await Crowdfunding.deploy(formatUnits(2, "wei"), beneficiary.address);

        const vaultAddr = await crowdfunding.vaultAddress();
        vault = Vault.attach(vaultAddr); 
    });

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            expect(await crowdfunding.owner()).to.equal(owner.address);
        });
        
        it("Should set the right maximum funding", async function () {
            expect(await crowdfunding.maximumFunding()).to.equal(formatUnits(2, "wei"));
        });

        it("Should set the right beneficiary", async function () {
            expect(await vault.beneficiary()).to.equal(beneficiary.address);
        });

        it("Should show vault balance is 0", async function () {
            expect(await vault.connect(beneficiary).getBalance()).to.equal(BigNumber.from(0));
        });

        it("Should show 0 contributors", async function () {
            expect(await crowdfunding.getNumberOfDonors()).to.equal(BigNumber.from(0));
        });

    });

    describe("Donations", function () {

        it("Should return ether sent without calling donate function", async function () {

        });

        it("Should transfer tokens between accounts", async function () {

        });

        it("Should transfer tokens between accounts", async function () {

        });
        
        it("Should transfer tokens between accounts", async function () {

        });

        it("Should update balances after transfers", async function () {

        });
    });

    describe("End of Campaign", function () {

    });
});
