import chaiModule from "chai";
import { chaiEthers } from "chai-ethers";
const chaiBignumber = require("chai-bignumber");
chaiModule.use(chaiEthers);
chaiModule.use(chaiBignumber());
export = chaiModule;
