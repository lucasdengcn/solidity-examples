// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import { IPermit2, IAllowanceTransfer, ISignatureTransfer } from "permit2/src/interfaces/IPermit2.sol";

contract Permit2App {
    // states
    IPermit2 public immutable permit2;

    constructor(address _permit2) {
        permit2 = IPermit2(_permit2);
    }

    // errors
    error InvalidSpender();
    error InvalidSignature();
    error InvalidSigner();

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

    // Normal signature Transfer
    function signatureTransfer(
        address token,
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) public {
        //
        ISignatureTransfer.PermitTransferFrom memory permitTransfer = ISignatureTransfer.PermitTransferFrom({
            permitted: ISignatureTransfer.TokenPermissions({ token: token, amount: amount }),
            nonce: nonce,
            deadline: deadline
        });
        //
        ISignatureTransfer.SignatureTransferDetails memory transferDetails = ISignatureTransfer
            .SignatureTransferDetails({ to: address(this), requestedAmount: amount });
        // The owner of the tokens has to be the signer
        // signature from signing hash of permit data per EIP-712 standards
        permit2.permitTransferFrom(permitTransfer, transferDetails, msg.sender, signature);
    }

    // witness
    struct Witness {
        address user;
    }
    string constant WITNESS_TYPE_STRING =
        "Witness witness)TokenPermissions(address token,uint256 amount)Witness(address user)";
    //
    bytes32 constant WITNESS_TYPEHASH = keccak256("Witness(address user)");

    // SignatureTransfer technique with extra witness data
    function signatureTransferWithWitness(
        address token,
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        address user, // example extra witness data
        bytes calldata signature
    ) public {
        //
        bytes32 witness = keccak256(abi.encode(WITNESS_TYPEHASH, Witness(user)));
        try
            permit2.permitWitnessTransferFrom(
                ISignatureTransfer.PermitTransferFrom({
                    permitted: ISignatureTransfer.TokenPermissions({ token: token, amount: amount }),
                    nonce: nonce,
                    deadline: deadline
                }),
                ISignatureTransfer.SignatureTransferDetails({ to: address(this), requestedAmount: amount }),
                msg.sender, // The owner of the tokens has to be the signer
                witness, // Extra data to include when checking the signature
                WITNESS_TYPE_STRING, // EIP-712 type definition for REMAINING string stub of the typehash
                signature // The resulting signature from signing hash of permit data per EIP-712 standards
            )
        {} catch Error(string memory err) {
            revert(err);
        } catch (bytes memory err) {
            assembly {
                // Look for revert reason and bubble it up if present
                // skips the length field, this revert will bubble the orignal error from call/delegatecall
                revert(add(err, 32), mload(err))
            }
        }
    }
}
