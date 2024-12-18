// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.10;

import "hardhat/console.sol";

contract ContractC {
    /// states
    uint256 public total;
    uint256 public limit;
    uint256 public limitCopy;
    //
    address internal owner;
    address internal contractAddress;
    //
    constructor(uint256 limit_) {
        owner = msg.sender;
        limit = limit_;
        limitCopy = limit_;
    }
    // errors
    error UnauthorizedErr();
    error AmountTooMuch();
    // events
    // modifiers
    modifier OnlyOwner() {
        if (msg.sender != owner) {
            revert UnauthorizedErr();
        }
        _;
    }
    // external functions
    function getOwner() public view returns (address) {
        return owner;
    }
    function updateContractAddress(address contractAddress_) external OnlyOwner returns (bool) {
        contractAddress = contractAddress_;
        return true;
    }
    function checkAmountCall(uint256 amount_) external {
        (bool flag, bytes memory err) = contractAddress.call(abi.encodeWithSignature("checkAmount(uint256)", amount_));
        console.log(flag);
        console.logBytes(err);
    }
    function depositCall(uint256 amount_) external returns (uint256) {
        (bool flag, bytes memory err) = contractAddress.call(abi.encodeWithSignature("checkAmount(uint256)", amount_));
        if (!flag) {
            console.logBytes(err);
            revert AmountTooMuch();
        }
        (flag, err) = contractAddress.call(abi.encodeWithSignature("deposit(uint256)", amount_));
        if (flag) {
            (flag, err) = contractAddress.call(abi.encodeWithSignature("getTotal()"));
            console.log(flag);
            console.logBytes(err);
        }
        return 0;
    }
    function depositDelegate(uint256 amount_) external returns (uint256) {
        (bool flag, bytes memory err) = contractAddress.call(abi.encodeWithSignature("checkAmount(uint256)", amount_));
        if (!flag) {
            console.logBytes(err);
            revert AmountTooMuch();
        }
        (flag, err) = contractAddress.delegatecall(abi.encodeWithSignature("deposit(uint256)", amount_));
        if (!flag) {
            console.logBytes(err);
        }
        // check local states
        if (limit != limitCopy) {
            console.log("limit != limitCopy");
            return 0;
        }
        return 1;
    }
    // public functions
    // internal functions
    // private functions
}