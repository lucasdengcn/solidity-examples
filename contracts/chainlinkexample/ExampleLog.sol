// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

contract ExampleLog {
    // events
    event WantsToCount(address indexed msgSender);

    function emitCountLog() public {
        emit WantsToCount(msg.sender);
    }
}
