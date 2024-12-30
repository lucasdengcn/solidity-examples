// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

// logic contract
contract FaRelayRegistry is ERC2771Context {
    //
    mapping(address => string) public names;
    mapping(string => address) public owners;
    // events
    event Registered(address indexed who, string name);

    //
    constructor(ERC2771Forwarder trustedForwarder) ERC2771Context(address(trustedForwarder)) {}

    //
    function register(string memory name) external {
        require(owners[name] == address(0), "name already registered");
        address who = _msgSender();
        names[who] = name;
        owners[name] = who;
        emit Registered(who, name);
    }
}
