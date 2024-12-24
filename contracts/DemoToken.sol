// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

// demo for upgrading contract
contract DemoToken {
    // states
    address public owner;

    //
    constructor() {
        owner = msg.sender;
    }

    // public functions
    function version() public pure returns (string memory) {
        return "1.0.0";
    }
}
