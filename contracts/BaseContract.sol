// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

abstract contract BaseContract {
    /// the max amount to process
    uint256 public limit;
    /// the total amount have been processed
    uint256 public total;
    //
    address public owner;
    bool internal mutexLocked;

    //
    constructor(uint256 limit_) {
        owner = msg.sender;
        limit = limit_;
    }

    // errors
    error UnauthorizedErr(address);
    error AmountOutOfRangeErr(uint256, uint256);
    error ReentranceErr(address);
    // modifiers
    modifier OnlyOwner() {
        if (msg.sender != owner) {
            console.log("check msg.sender:", msg.sender);
            revert UnauthorizedErr(msg.sender);
        }
        _;
    }
    modifier AmountInLimit(uint256 amount_) {
        if (amount_ > limit) {
            revert AmountOutOfRangeErr(limit, amount_);
        }
        _;
    }
    modifier Mutex() {
        if (mutexLocked) {
            revert ReentranceErr(msg.sender);
        }
        mutexLocked = true;
        _;
        mutexLocked = false;
    }

    /// external functions
    function isLocked() external view returns (bool) {
        return mutexLocked;
    }

    function isAmountInRange(uint256 amount_) external view returns (bool) {
        return amount_ < limit;
    }

    function forceLock() external returns (bool) {
        if (mutexLocked) {
            return false;
        }
        mutexLocked = true;
        return true;
    }

    /// private functions
    /// check Error is DepositTooMuch
    function isAmountOutOfRangeErr(bytes4 receivedSelector) internal pure returns (bool) {
        /// parsing error to verify
        bytes4 expectedSelector = AmountOutOfRangeErr.selector;
        // bytes4 receivedSelector = bytes4(data);
        if (receivedSelector == expectedSelector) {
            return true;
        }
        return false;
    }

    function isUnauthorizedErr(bytes4 receivedSelector) internal pure returns (bool) {
        /// parsing error to verify
        bytes4 expectedSelector = UnauthorizedErr.selector;
        // bytes4 receivedSelector = bytes4(data);
        if (receivedSelector == expectedSelector) {
            return true;
        }
        return false;
    }

    function isReentranceErr(bytes4 receivedSelector) internal pure returns (bool) {
        /// parsing error to verify
        bytes4 expectedSelector = ReentranceErr.selector;
        // bytes4 receivedSelector = bytes4(data);
        if (receivedSelector == expectedSelector) {
            return true;
        }
        return false;
    }
}
