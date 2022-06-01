const BigNumber = require('ethers').BigNumber;

function Enum (...options) {
  return Object.fromEntries(options.map((key, i) => [ key, BigNumber.from(i) ]));
}

module.exports = {
  Enum,
  ProposalState: Enum(
    'Pending',
    'Active',
    'Canceled',
    'Defeated',
    'Succeeded',
    'Queued',
    'Expired',
    'Executed',
  ),
  VoteType: Enum(
    'Against',
    'For',
    'Abstain',
  ),
};