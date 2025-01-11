// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * 1. Randomness and Uniquenesss of the secret information being committed.
 * 2. Hash Function should be secure and resistant to collision attacks
 * 3. Replay Attacks: the reveal process is designed to prevent replay attacks
 * 4. Timing Attacks: implementing a fixed reveal period or else.
 * 5. Reentrancy
 * 6. Access Control
 * @title CommitReveal
 * @author
 * @notice
 */
contract CommitRevealExample {
  address public owner;
  bytes32 public commitHash;
  uint public revealNumber;
  mapping(address => bool) public hasRevealed;

  constructor() {
    owner = msg.sender;
  }

  // The commit function now ensures that a commitment can only be made once and by the owner.
  function commit(bytes32 _hash) public {
    require(msg.sender == owner, 'Only the owner can commit');
    require(commitHash == 0, 'Commitment already made');

    commitHash = _hash;
  }

  // The reveal function checks if the sender has not already revealed and prevents replay attacks.
  function reveal(uint _number) public {
    require(msg.sender == owner, 'Only the owner can reveal');
    require(commitHash != 0, 'No commitment made');
    require(!hasRevealed[msg.sender], 'Already revealed');

    bytes32 hash = keccak256(abi.encodePacked(_number));
    require(hash == commitHash, 'Incorrect number');

    revealNumber = _number;
    hasRevealed[msg.sender] = true;
  }

  function generateHash(uint _number) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_number));
  }

  // Gas efficiency is improved by resetting the commitment state in the resetCommitment function.
  function resetCommitment() public {
    require(msg.sender == owner, 'Only the owner can reset');
    commitHash = 0;
    revealNumber = 0;
    hasRevealed[msg.sender] = false;
  }
}
