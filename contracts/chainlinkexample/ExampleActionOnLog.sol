// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { ILogAutomation, Log } from "@chainlink/contracts/src/v0.8/automation/interfaces/ILogAutomation.sol";

// an automation trigger based on log event
contract ExampleActionOnLog is ILogAutomation {
    // state variables
    uint256 public counted;
    // events
    event CountedBy(address indexed msgSender, uint256 count);

    // ILogAutomation.checkLog
    // can do some data preparation and return for performUpkeep to execute.
    function checkLog(
        Log calldata log,
        bytes calldata checkData
    ) external pure override returns (bool upkeepNeeded, bytes memory performData) {
        // check log data
        if (log.data.length == 0) {
            return (false, checkData);
        }
        // check log topics
        if (log.topics.length == 0) {
            return (false, checkData);
        }
        upkeepNeeded = true;
        // get the address topic from the log topics according to event signature.
        address msgSender = bytes32ToAddress(log.topics[1]);
        // performData will be passed to performUpkeep
        performData = abi.encode(msgSender);
    }

    // ILogAutomation.performUpkeep
    function performUpkeep(bytes calldata performData) external override {
        // decoding will be matching the encoding in checkLog
        address msgSender = abi.decode(performData, (address));
        // perform the action logic
        counted++;
        emit CountedBy(msgSender, counted);
    }

    function bytes32ToAddress(bytes32 _address) public pure returns (address) {
        return address(uint160(uint256(_address)));
    }
}
