// import { formatEther, formatUnits } from "@ethersproject/units";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { Contract } from "ethers";
// import { ethers } from "hardhat";

// import { expect } from "./chai-setup";

// describe("Crowdfunding contract", function () {
//     // Mocha has four functions that let you hook into the the test runner's
//     // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

//     // They're very useful to setup the environment for tests, and to clean it
//     // up after they run.

//     // A common pattern is to declare some variables, and assign them in the
//     // `before` and `beforeEach` callbacks.

//     let Crowdfunding;
//     let crowdfunding: Contract;
//     let admin: SignerWithAddress;
//     let serviceProvider: SignerWithAddress;
//     let donor1: SignerWithAddress;
//     let addrs: SignerWithAddress[];

//     // `beforeEach` will run before each test, re-deploying the contract every
//     // time. It receives a callback, which can be async.
//     before(async function () {
//         // Get the ContractFactory and Signers here.
//         Crowdfunding = await ethers.getContractFactory("Crowdfunding");
//         [admin, serviceProvider, donor1, ...addrs] = await ethers.getSigners();

//         // To deploy our contract, we just have to call Crowdfunding.deploy() and await
//         // for it to be deployed(), which happens onces its transaction has been
//         // mined.
//         crowdfunding = await Crowdfunding.deploy("admin");
//     });

//     // You can nest describe calls to create subsections.
//     describe("Deployment", function () {
//         // `it` is another Mocha function. This is the one you use to define your
//         // tests. It receives the test name, and a callback function.

//         // If the callback function is async, Mocha will `await` it.
//         it("Should set the right admin", async function () {
//             // Expect receives a value, and wraps it in an Assertion object. These
//             // objects have a lot of utility methods to assert values.

//             // This test expects the admin variable stored in the contract to be equal
//             // to our Signer's admin.
//             expect(await crowdfunding.hasRole(admin)).to.equal(true);
//         });

//         it("Should initialize a new campaign application and then accept it", async function () {

//             await crowdfunding.newCampaignApplication(formatUnits(2, "wei"), serviceProvider);
//             expect(crowdfunding.getApplicationStatus(0)).to.equal(false);

//             await crowdfunding.approveApplication(0);
//             expect(crowdfunding.getApplicationStatus(0)).to.equal(false);
//         });

//         it("should initialize a new campaign application and then deny it"), async ()=> {
//             await crowdfunding.newCampaignApplication(formatUnits(2, "wei"), serviceProvider);
//             expect(await crowdfunding.getApplicationStatus(1)).to.equal(false);

//             await crowdfunding.denyApplication(1);
//             expect(await crowdfunding.getApplicationStatus(1)).to.equal(false);

//         }
//     });

//     describe("Donations", function () {
//         xit("Should transfer tokens between accounts", async function () {
//             // Transfer 50 tokens from admin to addr1
//             await crowdfunding.donate(
//                 0
//             );
//             const donor1Balance = await crowdfunding.balanceOf(donor1.address);
//             expect(donor1Balance).to.equal(50);

//             // Transfer 50 tokens from donor1 to addr2
//             // We use .connect(signer) to send a transaction from another account

//             // await crowdfunding.connect(donor1).transfer(addr2.address, 50);
//             // const addr2Balance = await crowdfunding.balanceOf(addr2.address);
//             // expect(addr2).to.equal(50);
//         });

//         xit("Should update balances after transfers", async function () {
//         });
//     });
// });
