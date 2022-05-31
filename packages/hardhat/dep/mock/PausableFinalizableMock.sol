// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../common/PausableFinalizable.sol";

contract PausableFinalizableMock is PausableFinalizable {
    bool public drasticMeasureTaken = false;
    uint256 public count = 0;

    constructor() {}

    function normalProcess() external whenActiveAndUnpaused {
        count++;
    }

    function drasticMeasure() external whenActive {
        drasticMeasureTaken = true;
    }

    function finalize() external whenActive {
        _finalize();
    }

    function pause() external whenActive {
        _pause();
    }

    function unpause() external whenActive {
        _unpause();
    }
}