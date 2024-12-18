// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.10;

contract ContractA {
    // states
    uint256 public amount;
    uint256 public total;
    //
    address internal owner;
    bool internal locked;

    //
    constructor(uint256 amount_) {
        owner = msg.sender;
        amount = amount_;
    }

    // errors
    error UnauthorizedErr();
    error AccountLockedErr();
    // events
    event AccountLocked();
    event AccountReleased();
    // modifiers
    modifier OnlyOwner() {
        if (msg.sender != owner) {
            revert UnauthorizedErr();
        }
        _;
    }

    // external function
    function checkLocked() external view returns (bool) {
        return locked;
    }

    function checkAmount(uint256 amount_) external view returns (bool) {
        return amount_ > amount;
    }

    function deposit(uint256 amount_) external returns (bool) {
        total += amount_;
        return true;
    }

    function getTotal() external view returns (uint256) {
        return total;
    }

    function checkOwner() external view returns (address) {
        return owner;
    }

    // public function
    function lockContract() public OnlyOwner {
        locked = true;
    }

    function unlockContract() public OnlyOwner {
        locked = false;
    }

    function mint1() public pure returns (bool) {
        revert UnauthorizedErr();
    }

    function mint2() public view returns (bool) {
        if (this.checkLocked()) {
            return false;
        } else {
            return true;
        }
    }
    // internal functions

    // private functions
}
