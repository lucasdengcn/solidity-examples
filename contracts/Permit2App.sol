// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import { IPermit2, IAllowanceTransfer, ISignatureTransfer } from "permit2/src/interfaces/IPermit2.sol";

contract Permit2App {
    // states
    IPermit2 public immutable permit2;

    constructor(address _permit2) {
        permit2 = IPermit2(_permit2);
    }

    // errors
    error InvalidSpender();

    // public functions
    // Allowance Transfer. when permit has not yet been called or needs to be refreshed.
    function allowanceTransferWithPermit(
        IAllowanceTransfer.PermitSingle calldata permitSingle,
        bytes calldata signature,
        uint160 amount
    ) public {
        permitWithPermit2(permitSingle, signature);
        _receiveUserTokens(permitSingle.details.token, amount);
    }

    // Allowance Transfer. when permit has been called already
    // and isn't expired, within allowed amount.
    function allowanceTransferWithoutPermit(address token, uint160 amount) public {
        _receiveUserTokens(token, amount);
    }

    function permitWithPermit2(IAllowanceTransfer.PermitSingle calldata permitSingle, bytes calldata signature) public {
        // This contract must have spending permissions for the user.
        if (permitSingle.spender != address(this)) {
            revert InvalidSpender();
        }
        // owner is explicity msg.sender
        permit2.permit(msg.sender, permitSingle, signature);
    }

    // Transfers the allowed tokens from user to spender (current contract)
    function _receiveUserTokens(address token, uint160 amount) internal {
        permit2.transferFrom(msg.sender, address(this), amount, token);
    }
}
