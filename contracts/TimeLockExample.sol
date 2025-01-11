// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimeLockExample {
  address public owner;
  uint public unlockTime;
  mapping(address => bool) public authorizedUsers;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyAuthorized() {
    require(authorizedUsers[msg.sender] || msg.sender == owner, 'Not authorized to call this function');
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the contract owner can call this function');
    _;
  }

  function addAuthorizedUser(address _user) external onlyOwner {
    authorizedUsers[_user] = true;
  }

  function removeAuthorizedUser(address _user) external onlyOwner {
    authorizedUsers[_user] = false;
  }

  function lockFor(uint _time) external onlyOwner {
    unlockTime = block.timestamp + _time; // Set the unlock time
  }

  function unlock() external onlyAuthorized {
    require(block.timestamp >= unlockTime, 'The time lock has not expired yet');
    // Perform actions once the time lock has expired
    // For demonstration purposes, let's emit an event
    emit Unlocked(msg.sender, block.timestamp);
  }

  event Unlocked(address indexed caller, uint unlockTimestamp);
}
