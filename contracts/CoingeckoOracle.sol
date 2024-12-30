// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract CoingeckoOracle {
    uint256 public price;
    uint256 public lastUpdated;

    event PriceUpdated(uint256 indexed timeStamp, uint256 price);

    function updatePrice(uint256 _price) external {
        price = _price;
        lastUpdated = block.timestamp;

        emit PriceUpdated(block.timestamp, _price);
    }
}
