// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

// a regular contract
contract FaSimpleRegistry {
    //
    mapping(address => string) public names;
    mapping(string => address) public owners;
    // events
    event Registered(address indexed who, string name);

    //
    function register(string memory name) external {
        require(owners[name] == address(0), "name already registered");
        address who = msg.sender;
        names[who] = name;
        owners[name] = who;
        emit Registered(who, name);
    }
}
