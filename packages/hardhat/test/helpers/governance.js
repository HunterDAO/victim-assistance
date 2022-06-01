const { time } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');

function zip (...args) {
  return Array(Math.max(...args.map(array => array.length)))
    .fill()
    .map((_, i) => args.map(array => array[i]));
}

function concatHex (...args) {
  return web3.utils.bytesToHex([].concat(...args.map(h => web3.utils.hexToBytes(h || '0x'))));
}

function concatOpts (args, opts = null) {
  return opts ? args.concat(opts) : args;
}

class GovernorHelper {
  constructor (governor) {
    this.governor = governor;
  }

  delegate (delegation = {}, opts = null) {
    return Promise.all([
      delegation.token.delegate(delegation.to, { from: delegation.to }),
      delegation.value &&
        delegation.token.transfer(...concatOpts([ delegation.to, delegation.value ]), opts),
      delegation.tokenId &&
        delegation.token.ownerOf(delegation.tokenId).then(owner =>
          delegation.token.transferFrom(...concatOpts([ owner, delegation.to, delegation.tokenId ], opts)),
        ),
    ]);
  }

  propose (opts = null) {
    const proposal = this.currentProposal;

    return this.governor.connect(opts.from).functions.propose(...concatOpts(proposal.fullProposal, null));
  }

  queue (opts = null) {
    const proposal = this.currentProposal;

    return proposal.useCompatibilityInterface
    // (uint256)]
      ? this.governor.connect(opts.from).functions.queue(...concatOpts(
        [ proposal.id ],
        null,
      ))
      : this.governor.connect(opts.from).functions.queue(...concatOpts(
        proposal.shortProposal,
        null,
      ));
  }

  execute (opts = null) {
    const proposal = this.currentProposal;

    return proposal.useCompatibilityInterface
      ? this.governor.functions.execute(...concatOpts(
        [ proposal.id ],
        null,
      ))
      : this.governor.functions.execute(...concatOpts(
        proposal.shortProposal,
        null,
      ));
  }

  cancel (opts = null) {
    const proposal = this.currentProposal;

    return proposal.useCompatibilityInterface
      ? this.governor.functions.cancel(...concatOpts(
        [ proposal.id ],
        null,
      ))
      : this.governor.functions.cancel(...concatOpts(
        proposal.shortProposal,
        null,
      ));
  }

  vote (vote = {}, opts = null) {
    const proposal = this.currentProposal;

    return vote.signature
      // if signature, and either params or reason →
      ? vote.params || vote.reason
        ? vote.signature({
          proposalId: proposal.id,
          support: vote.support,
          reason: vote.reason || '',
          params: vote.params || '',
        }).then(({ v, r, s }) => this.governor.connect(opts.from).castVoteWithReasonAndParamsBySig(...concatOpts(
          [ proposal.id, vote.support, vote.reason || '', vote.params || '', v, r, s ],
          null,
        )))
        : vote.signature({
          proposalId: proposal.id,
          support: vote.support,
        }).then(({ v, r, s }) => this.governor.connect(opts.from).castVoteBySig(...concatOpts(
          [ proposal.id, vote.support, v, r, s ],
          null,
        )))
      : vote.params
        // otherwise if params
        ? this.governor.connect(opts.from).castVoteWithReasonAndParams(...concatOpts(
          [ proposal.id, vote.support, vote.reason || '', vote.params ],
          null,
        ))
        : vote.reason
          // otherwise if reason
          ? this.governor.connect(opts.from).castVoteWithReason(...concatOpts(
            [ proposal.id, vote.support, vote.reason ],
            null,
          ))
          : this.governor.connect(opts.from).castVote(...concatOpts(
            [ proposal.id, vote.support ],
            null,
          ));
  }

  waitForSnapshot (offset = 0) {
    const proposal = this.currentProposal;
    return this.governor.proposalSnapshot(proposal.id)
      .then(blockNumber => time.advanceBlockTo(blockNumber.add(offset)));
  }

  waitForDeadline (offset = 0) {
    const proposal = this.currentProposal;
    return this.governor.proposalDeadline(proposal.id)
      .then(blockNumber => time.advanceBlockTo(blockNumber.add(offset)));
  }

  waitForEta (offset = 0) {
    const proposal = this.currentProposal;
    return this.governor.proposalEta(proposal.id)
      .then(timestamp => time.increaseTo(timestamp.add(offset)));
  }

  /**
   * Specify a proposal either as
   * 1) an array of objects [{ target, value, data, signature? }]
   * 2) an object of arrays { targets: [], values: [], data: [], signatures?: [] }
   */
  setProposal (actions, description) {
    let targets, values, signatures, data, useCompatibilityInterface;

    if (Array.isArray(actions)) {
      useCompatibilityInterface = actions.some(a => 'signature' in a);
      targets = actions.map(a => a.target);
      values = actions.map(a => a.value || '0');
      signatures = actions.map(a => a.signature || '');
      data = actions.map(a => a.data || '0x');
    } else {
      useCompatibilityInterface = Array.isArray(actions.signatures);
      ({ targets, values, signatures = [], data } = actions);
    }

    const fulldata = zip(signatures.map(s => s && web3.eth.abi.encodeFunctionSignature(s)), data)
      .map(hexs => concatHex(...hexs));

    const descriptionHash = web3.utils.keccak256(description);

    // condensed version for queueing end executing
    const shortProposal = [
      targets,
      values,
      fulldata,
      descriptionHash,
    ];

    // full version for proposing
    const fullProposal = [
      targets,
      values,
      ...(useCompatibilityInterface ? [ signatures ] : []),
      data,
      description,
    ];

    // proposal id
    const id = ethers.BigNumber.from(web3.utils.keccak256(web3.eth.abi.encodeParameters(
      [ 'address[]', 'uint256[]', 'bytes[]', 'bytes32' ],
      shortProposal,
    )));

    this.currentProposal = {
      id,
      targets,
      values,
      signatures,
      data,
      fulldata,
      description,
      descriptionHash,
      shortProposal,
      fullProposal,
      useCompatibilityInterface,
    };

    return this.currentProposal;
  }
}

module.exports = {
  GovernorHelper,
};