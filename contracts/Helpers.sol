// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

contract Helpers {
    // public functions
    function storageLocation(string memory namespaceId) public pure returns (bytes32) {
        bytes32 location = keccak256(abi.encode(uint256(keccak256(bytes(namespaceId))) - 1)) & ~bytes32(uint256(0xff));
        return location;
    }
}
