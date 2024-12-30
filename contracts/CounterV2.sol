// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract CounterV2 {
    uint256 public total;

    event PriceUpdated(uint256 indexed timeStamp, uint256 price);

    function increaseCount(uint256 offset) external {
        total += offset;
    }
}
