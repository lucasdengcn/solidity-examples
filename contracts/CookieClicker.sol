// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract CookieClicker is Multicall, Nonces {
    uint256 public cookies = 0;

    function click() public {
        cookies += 1;
    }

    function nonce(address owner) public {
        super._useNonce(owner);
    }
}
