// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract AutoCustomContract is AutomationCompatibleInterface {
    //
    uint256 public counter;
    uint256 public immutable interval;
    uint256 public lastTimestamp;

    //
    constructor(uint256 updateInterval) {
        interval = updateInterval;
        lastTimestamp = block.timestamp;
        counter = 0;
    }

    // check to see if the contract should run on condition.
    function checkUpkeep(bytes calldata checkData) external view override returns (bool, bytes memory) {
        return (block.timestamp - lastTimestamp) > interval ? (true, checkData) : (false, checkData);
    }

    // perform the upkeep on condition meet.
    function performUpkeep(bytes calldata performData) external override {
        if (block.timestamp - lastTimestamp > interval) {
            lastTimestamp = block.timestamp;
            counter++;
        }
    }
}
