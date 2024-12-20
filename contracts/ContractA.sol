// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "./BaseContract.sol";

contract ContractA is BaseContract {
    //
    constructor(uint256 amount_) BaseContract(amount_) {}

    // events
    event AmountDeposited(uint256);

    // errors
    // modifies

    // external function
    function deposit(uint256 amount_) external OnlyOwner AmountInLimit(amount_) Mutex returns (bool) {
        total += amount_;
        emit AmountDeposited(amount_);
        return true;
    }
    // public functions
    // internal functions
    // private functions
}
