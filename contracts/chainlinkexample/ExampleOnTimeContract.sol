// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

// will be trigger given time interval (cron expression)
contract ExampleOnTimeContract {
    //
    uint256 public counter = 0;

    //
    constructor() {}

    function incr() public returns (bool) {
        counter++;
        return true;
    }
}
