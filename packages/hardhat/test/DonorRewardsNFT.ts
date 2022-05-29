import { 
    BigNumber, 
    Contract, 
    ContractFactory
} from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DonorRewardsNFT", () => {
    let daoExecutor: SignerWithAddress;
    let donor1: SignerWithAddress;
    let donor2: SignerWithAddress;
    let donor3: SignerWithAddress;
    let accounts: SignerWithAddress[];
    
    let DonorRewards: ContractFactory;
    let donorRewards: Contract;

    before(async () => {
        [daoExecutor, donor1, donor2, donor3, ...accounts] = await ethers.getSigners();

        const DonorRewards = (await ethers.getContractFactory(
            "DonorRewardsNFT",
            accounts[0]
        ));

        donorRewards = await DonorRewards.deploy(daoExecutor.address);
    });

    describe("Minting", () => {

        it("Should Increase Total Supply When Minting", async () => {
            expect(await donorRewards.totalSupply()).to.equal(0);
            await donorRewards.connect(daoExecutor).safeMint(
                donor1.address,
                "http://base1.uri/"
            );
            await donorRewards.connect(daoExecutor).safeMint(
                donor2.address,
                "http://base2.uri/"
            );
            await donorRewards.connect(daoExecutor).safeMint(
                donor3.address,
                "http://base3.uri/"
            );
            expect(await donorRewards.totalSupply()).to.equal(3);
        });

        it("Should have the correct tokenURIs", async () => {
            expect(await donorRewards.tokenURI(BigNumber.from(0))).to.equal("http://base1.uri/");
            expect(await donorRewards.tokenURI(BigNumber.from(1))).to.equal("http://base2.uri/");
            expect(await donorRewards.tokenURI(BigNumber.from(2))).to.equal("http://base3.uri/");
        });

        it("Should update the tokenURI if necessary", async () => {
            await donorRewards.connect(daoExecutor).updateTokenURI(BigNumber.from(0), "http://base0.uri/");
            expect(await donorRewards.tokenURI(BigNumber.from(0))).to.equal("http://base0.uri/");
        });

        it("Should revert if token does not exist", async () => {
            await expect(donorRewards.tokenURI(BigNumber.from(9001))).to.be.reverted;
        });

    });

    describe("AccessControl", () => {

        it("Should revert if not CrowdfundingCampaign contract or admin", async () => {
            await expect(donorRewards.connect(donor1).safeMint(donor1.address, "http://base9001.uri/")).to.be.reverted;
            await expect(donorRewards.connect(donor1).pause()).to.be.reverted;
            await expect(donorRewards.connect(donor1).unpause()).to.be.reverted;
        });

        it("Should pause and successfully block all functions with whenNotPaused", async () => {
            await donorRewards.connect(daoExecutor).pause();
            expect(await donorRewards.paused()).to.equal(true);
            await expect(donorRewards.connect(daoExecutor).safeMint(donor1.address, "http://base9001.uri/")).to.be.reverted;
            await expect(donorRewards.connect(daoExecutor).updateTokenURI(BigNumber.from(0), "http://base0.uri/")).to.be.reverted;
            await expect(donorRewards.connect(daoExecutor).pause()).to.be.reverted;
        });

        it("Should unpause", async () => {
            await donorRewards.connect(daoExecutor).unpause();
            expect(await donorRewards.paused()).to.equal(false);
        });

    });
});
