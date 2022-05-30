// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

contract HCRegistry {

    address payable victimAssistance;
    constructor() {}

    function registerHC(address payable _victimAssistance) external {
        victimAssistance = _victimAssistance;
    }

    function getHC() external view returns (address payable) {
        return victimAssistance;
    }
    
}