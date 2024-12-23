// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SafeTokenApp {
    //
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC1363;
    // states
    address public token;

    //
    constructor(address gldTokenAddress) {
        token = gldTokenAddress;
    }

    function transfer(address to, uint256 amount) public {
        // transfer contract's token to address
        IERC20(token).safeTransfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public {
        // spending the approval given by `from` to the calling contract
        // allowance (from --> contract)
        // transfer (contract --> to)
        IERC20(token).safeTransferFrom(from, to, amount);
    }

    function approve(address to, uint256 amount) public {
        // allowance (contract --> to)
        IERC20(token).forceApprove(to, amount);
    }

    function increaseAllowance(address to, uint256 amount) public {
        IERC20(token).safeIncreaseAllowance(to, amount);
    }

    function decreaseAllowance(address to, uint256 amount) public {
        IERC20(token).safeDecreaseAllowance(to, amount);
    }
}
