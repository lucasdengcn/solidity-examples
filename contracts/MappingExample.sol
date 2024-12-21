// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract MappingExample {
    // states
    // the key data is not stored in a mapping, only its keccak256 hash is used to look up the value.
    mapping(address => uint256) _balances;

    //
    constructor() {}

    function deposit(address to, uint256 amount) external returns (bool) {
        _balances[to] = amount;
        return true;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function withdraw(address from, uint256 amount) external returns (uint256) {
        _balances[from] = _balances[from] - amount;
        return _balances[from];
    }

    function remove(address addr) external returns (bool) {
        delete _balances[addr];
        return true;
    }
}
