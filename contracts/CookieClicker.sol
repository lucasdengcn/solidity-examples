// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CookieClicker is Multicall, Nonces, ReentrancyGuard {
    uint256 public cookies = 0;

    function click() public nonReentrant {
        cookies += 1;
    }

    function nonce(address owner) public nonReentrant {
        super._useNonce(owner);
    }
}
