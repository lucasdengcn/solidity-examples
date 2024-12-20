// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract EncodingExample {
    constructor() {}

    // error
    error Error1(address);
    error Error2(address, uint);

    function packCustomError1() public pure {
        address address_ = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
        // the Method ID. This is derived as the first 4 bytes of the Keccak hash of the ASCII form of the method signature
        bytes4 selector = bytes4(keccak256("Error1(address)"));
        bytes memory args = abi.encode(address_);
        console.log("selector len:", selector.length);
        console.logBytes32(selector);
        console.log("-----");
        console.log("args len:", args.length);
        console.logBytes(args);
        //
        console.log("-----");
        bytes memory contacted = bytes.concat(selector, args);
        console.logBytes(contacted);
        //
        console.log("-----");
        bytes memory full = abi.encodeWithSignature("Error1(address)", address_);
        console.logBytes(full);
        //
        console.log("full len: ", full.length);
        // assert(contacted.length == full.length);
        (bytes4 selectorB4, bytes32 argB32) = splitErrorData(full);
        console.log("-----");
        console.logBytes4(selectorB4);
        console.logBytes32(argB32);
    }

    function packCustomError2() public pure {
        address address_ = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
        uint v1 = 123;
        // the Method ID. This is derived as the first 4 bytes of the Keccak hash of the ASCII form of the method signature
        bytes4 selector = bytes4(keccak256("Error2(address,uint)"));
        bytes memory args = abi.encode(address_, v1);
        console.log("selector len:", selector.length);
        console.logBytes32(selector);
        console.log("-----");
        console.log("args len:", args.length);
        console.logBytes(args);
        //
        console.log("-----");
        bytes memory contacted = bytes.concat(selector, args);
        console.logBytes(contacted);
        //
        console.log("-----");
        bytes memory full = abi.encodeWithSignature("Error2(address,uint)", address_, v1);
        console.logBytes(full);
        //
        console.log("full len: ", full.length);
        // assert(contacted.length == full.length);
        (bytes4 selectorB4, bytes32 args0, bytes32 args1) = splitErrorData2(full);
        console.log("-----");
        console.logBytes4(selectorB4);
        console.logBytes32(args0);
        console.logBytes32(args1);
    }

    function packArgs() public pure {
        address address_ = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
        uint v1 = 123;
        //
        bytes memory arg0 = abi.encode(address_);
        bytes memory arg1 = abi.encode(v1);
        //
        bytes memory argsFull = abi.encode(address_, v1);
        //
        console.log("arg0: ", arg0.length);
        console.logBytes(arg0);
        //
        console.log("arg1: ", arg1.length);
        console.logBytes(arg1);
        //
        console.log("argsFull: ", argsFull.length);
        console.logBytes(argsFull);
    }

    function packString() public pure {
        string memory a = "A";
        string memory b = "B";
        string memory c = string.concat(a, b);
        console.log(c);
    }

    // private functions
    function splitErrorData(bytes memory data) internal pure returns (bytes4 selector, bytes32 result) {
        assembly {
            selector := mload(add(data, 32))
            result := mload(add(data, 36))
        }
    }

    function splitErrorData2(bytes memory data) internal pure returns (bytes4 selector, bytes32 arg0, bytes32 arg1) {
        assembly {
            selector := mload(add(data, 32)) // 4 bytes
            arg0 := mload(add(data, 36)) // 4 + 32
            arg1 := mload(add(data, 68)) // 4 + 32 + 32
        }
    }

    function bytes32ToBytes(bytes32 data) internal pure returns (bytes memory) {
        bytes memory result = new bytes(32);
        assembly {
            mstore(add(result, 32), data)
        }
        return result;
    }
}
