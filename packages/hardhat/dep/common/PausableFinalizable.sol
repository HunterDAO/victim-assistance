// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract PausableFinalizable is Pausable {

    bool private _active = true;

    event Finalize(address account);

    modifier whenActive() {
        require(_active, "PausableFinalizable: finalized");
        _;
    }
        
    modifier whenActiveAndUnpaused() {
        require(_active, "PausableFinalizable: finalized ");
        require(!paused(), "PausableFinalizable: paused!");
        _;
    }

    modifier whenActiveAndPaused() {
        require(_active, "PausableFinalizable: finalized");
        require(paused(), "PausableFinalizable: paused");
        _;
    }

    modifier whenFinal() {
        require(!_active, "PausableFinalizable: active");
        _;
    }

    function active() public view returns (bool) {
        return !_active;
    }

    function _finalize() internal {
        _active = false;
    }

}