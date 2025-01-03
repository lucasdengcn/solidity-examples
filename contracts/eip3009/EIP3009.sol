// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { EIP3009Internals } from "./EIP3009Internals.sol";
import { IEIP3009 } from "./IEIP3009.sol";

// Basic of EIP3009 for testing purposes ONLY.
abstract contract EIP3009 is EIP3009Internals, IEIP3009, ReentrancyGuard {
    // constructor
    constructor(
        string memory name,
        string memory symbol,
        string memory version
    ) EIP3009Internals(name, symbol, version) {}

    /**
     * @notice Execute a transfer with a signed authorization
     * @param from          Owner's address (Authorizer)
     * @param to            Receiver's address
     * @param value         Amount to be transferred
     * @param validAfter    The time after which this is valid (unix time)
     * @param validBefore   The time before which this is valid (unix time)
     * @param nonce         Unique nonce
     * @param v             v of the signature
     * @param r             r of the signature
     * @param s             s of the signature
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        _transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
    }

    /**
     * @notice Receive a transfer with a signed authorization from the Owner
     * @dev This has an additional check to ensure that the Receiver's address
     * matches the caller of this function to prevent front-running attacks.
     * @param from          Owner's address (Authorizer)
     * @param to            Receiver's address
     * @param value         Amount to be transferred
     * @param validAfter    The time after which this is valid (unix time)
     * @param validBefore   The time before which this is valid (unix time)
     * @param nonce         Unique nonce
     * @param v             v of the signature
     * @param r             r of the signature
     * @param s             s of the signature
     */
    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        _receiveWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
    }

    /**
     * @notice Attempt to cancel an authorization
     * @dev Works only if the authorization is not yet used.
     * @param authorizer    Authorizer's address
     * @param nonce         Nonce of the authorization
     * @param v             v of the signature
     * @param r             r of the signature
     * @param s             s of the signature
     */
    function cancelAuthorization(
        address authorizer,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        _cancelAuthorization(authorizer, nonce, v, r, s);
    }
}
