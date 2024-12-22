// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenReceiver {
    IERC20 public token;
    //
    mapping(address => uint256) public pendingTokens;
    mapping(address => bool) private _isProcessingTokens;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function transferTokens(address recipient, uint256 amount) external {
        // Transfer tokens from the sender to this contract
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Store the received tokens for processing in the next transaction
        pendingTokens[msg.sender] += amount;
    }

    function processTokens() external {
        uint256 amount = pendingTokens[msg.sender];
        require(amount > 0, "No pending tokens to process");

        // Ensure re-entrancy guard
        require(!_isProcessingTokens[msg.sender], "Tokens are being processed");
        _isProcessingTokens[msg.sender] = true;

        // Process the received tokens
        _processTokens(amount);

        // Reset the pending tokens after processing
        pendingTokens[msg.sender] = 0;

        // Release the re-entrancy guard
        _isProcessingTokens[msg.sender] = false;
    }

    function _processTokens(uint256 amount) internal {
        // Ensure re-entrancy guard
        require(!_isProcessingTokens[msg.sender], "Tokens are being processed");
        _isProcessingTokens[msg.sender] = true;

        require(token.balanceOf(address(this)) >= amount, "Insufficient tokens available for processing");
        // Process the received tokens
        // Now the tokens are available for processing in a separate function call

        // Reset the re-entrancy guard
        _isProcessingTokens[msg.sender] = false;
    }
}
