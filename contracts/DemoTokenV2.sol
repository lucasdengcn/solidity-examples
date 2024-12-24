// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

// demoV2 for upgrading contract
contract DemoTokenV2 {
    // states
    address public owner;
    string public name;

    //
    constructor() {
        owner = msg.sender;
    }

    // public functions
    function version() public pure returns (string memory) {
        return "2.0.0";
    }

    function setName(string memory _name) public {
        name = _name;
    }
}
