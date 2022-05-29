// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract PausableFinalizable is Pausable {

    bool private _finalized = false;

    event Finalize(address account);

    modifier whenActive() {
        require(!_finalized, "Contract has been finalized!");
        _;
    }
        
    modifier whenActiveAndNotPaused() {
        require(!_finalized, "Contract has been finalized!");
        require(!paused(), "Contract is paused!");
        _;
    }

    modifier whenActiveAndPaused() {
        require(!_finalized, "Contract has been finalized!");
        require(paused(), "Contract is not paused!");
        _;
    }

    modifier whenFinal() {
        require(_finalized, "Contract has been finalized!");
        _;
    }

    function _finalize() internal {
        _finalized = true;
    }

    function isActive() public view returns (bool) {
        return !_finalized;
    }

}