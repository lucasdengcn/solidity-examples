// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "./BaseContract.sol";
import "hardhat/console.sol";

contract ContractA is BaseContract {
    //
    constructor(uint256 amount_) BaseContract(amount_) {}

    // events
    event AmountDeposited(uint256);
    event AmountReceived(address sender, uint256 amount, uint gas);
    event AmountReceivedFallback(address sender, uint256 amount, uint gas);

    // errors
    // modifies
    // external function
    receive() external payable {
        // value in Wei unit
        // console.log("Received: ", msg.value);
        emit AmountReceived(msg.sender, msg.value, gasleft());
    }

    fallback() external payable {
        // value in Wei unit
        console.log("Fallback: ", msg.value);
        emit AmountReceivedFallback(msg.sender, msg.value, gasleft());
    }

    function deposit(uint256 amount_) external OnlyOwner AmountInLimit(amount_) Mutex returns (bool) {
        total += amount_;
        emit AmountDeposited(amount_);
        return true;
    }

    // public functions
    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    // internal functions
    // private functions
}
