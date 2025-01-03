// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { EIP3009 } from "./eip3009/EIP3009.sol";

// demo for upgrading contract
contract DemoToken is EIP3009 {
    // states
    address public owner;

    //
    constructor() EIP3009("DemoToken", "DTK", "1") {
        owner = msg.sender;
        _mint(owner, 1000 * 10 ** 18);
    }

    // public functions
    function version() public pure returns (string memory) {
        return "1.0.0";
    }
}
