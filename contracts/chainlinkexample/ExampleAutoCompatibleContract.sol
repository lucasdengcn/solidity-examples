// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import { OwnerIsCreator } from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";

// an automation compatible contract for registration
contract ExampleAutoCompatibleContract is AutomationCompatibleInterface, OwnerIsCreator {
    // state variables
    uint256 public counter;
    uint256 public immutable interval;
    uint256 public lastTimestamp;
    //
    address public sForwarderAddress;

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
        require(msg.sender == sForwarderAddress, "This address is not allowed to call performUpkeep function");
        if (block.timestamp - lastTimestamp > interval) {
            lastTimestamp = block.timestamp;
            counter++;
        }
    }

    // protect performUpkeep function
    /// @notice Set the address that `performUpkeep` is called from
    /// @dev Only callable by the owner
    /// @param forwarderAddress the address to set
    function setForwarderAddress(address forwarderAddress) external onlyOwner {
        sForwarderAddress = forwarderAddress;
    }
}
