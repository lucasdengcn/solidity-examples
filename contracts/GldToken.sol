// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GldToken is ERC20 {
    // states
    uint256 public limit;
    address public owner;
    bool internal mutexLocked;

    //
    constructor(uint256 limit_) ERC20("Gold", "GLD") {
        limit = limit_;
        owner = msg.sender;
        _mint(msg.sender, limit_);
    }

    // events
    event TokenMinedEvent(address to_, uint256 amount_);
    // errors
    error UnauthorizedErr(address);
    error ReentranceErr(address);
    // modifiers
    modifier OwnerOnly() {
        if (msg.sender != owner) {
            revert UnauthorizedErr(msg.sender);
        }
        _;
    }
    modifier Mutex() {
        if (mutexLocked) {
            revert ReentranceErr(msg.sender);
            return;
        }
        mutexLocked = true;
        _;
        mutexLocked = false;
    }

    /// external functions
    function isLocked() external view returns (bool) {
        return mutexLocked;
    }

    function forceLock() external returns (bool) {
        if (mutexLocked) {
            return false;
        }
        mutexLocked = true;
        return true;
    }

    function mint(address to_, uint256 amount_) external OwnerOnly {
        _mint(to_, amount_);
        emit TokenMinedEvent(to_, amount_);
    }

    /// internal function
    function _mintMinerReward() internal {
        _mint(block.coinbase, 1000);
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        if (!(from == address(0) && to == block.coinbase)) {
            _mintMinerReward();
        }
        super._update(from, to, value);
    }
}
