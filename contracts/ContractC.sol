// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "./BaseContract.sol";

contract ContractC is BaseContract {
    /// states
    uint256 public limitCopy;
    //
    // address internal owner;
    address internal contractAddress;

    //
    constructor(uint256 limit_) BaseContract(limit_) {
        limitCopy = limit_;
    }

    // errors
    error CheckAmountCallErr();
    error DepoistCallUnknowErr();
    error DepositTooMuchErr(uint256, uint256);
    // events
    event TargetContractAddressUpdated(address);
    event DepositCallErrEvent();
    event DepositCallSuccessEvent();
    event SendSuccessEvent(uint txKind, uint amount);

    // modifiers
    // external functions
    /// update target contract address
    function updateContractAddress(address contractAddress_) external OnlyOwner {
        contractAddress = contractAddress_;
        emit TargetContractAddressUpdated(contractAddress);
    }

    /// check amount limit
    function checkAmountCall(uint256 amount_) external view returns (bool) {
        (bool flag, bytes memory resp) = contractAddress.staticcall(
            abi.encodeWithSignature("isAmountInRange(uint256)", amount_)
        );
        if (!flag) {
            revert CheckAmountCallErr();
        }
        // 0x is empty
        // console.logBytes(resp);
        bool ok = abi.decode(resp, (bool));
        return ok;
    }

    /// send amount to target address
    // NOT RECOMMEND via send
    function sendAmount(uint txKind) external payable returns (bool) {
        address payable recipient = payable(contractAddress);
        bool sent = recipient.send(msg.value);
        // console.log("income msg.sender:", msg.sender);
        console.log("sendAmount", sent, gasleft());
        // require(sent, "Failed to send Ether");
        if (sent) {
            emit SendSuccessEvent(txKind, msg.value);
            return true;
        }
        return false;
    }

    /// transfer amount to target address
    // NOT RECOMMEND via transfer
    function transferAmount(uint txKind) external payable returns (bool) {
        payable(contractAddress).transfer(msg.value);
        emit SendSuccessEvent(txKind, msg.value);
        return true;
    }

    /// call to transfer amount to target address
    // RECOMMEND via call
    function sendCall(uint txKind) public payable returns (bool) {
        address payable recipient = payable(contractAddress);
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = recipient.call{ value: msg.value }("");
        // console.log(sent);
        // console.logBytes(data);
        // require(sent, "Failed to send Ether");
        if (!sent) {
            handleError(data);
        }
        emit SendSuccessEvent(txKind, msg.value);
        return true;
    }

    /// call to transfer amount to target address
    // RECOMMEND via call
    function sendReceipientCall(address payable recipient, uint txKind) public payable returns (bool) {
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = recipient.call{ value: msg.value }("");
        // console.log(sent);
        // console.logBytes(data);
        // require(sent, "Failed to send Ether");
        if (!sent) {
            handleError(data);
        }
        emit SendSuccessEvent(txKind, msg.value);
        return true;
    }

    /// deposit via call, using different sender to invoke call,
    /// the call will always failed given other side's verification on sender
    function depositCall(uint256 amount_) external returns (bool) {
        // console.log("income msg.sender:", msg.sender);
        (bool flag, bytes memory data) = contractAddress.call(abi.encodeWithSignature("deposit(uint256)", amount_));
        if (flag) {
            emit DepositCallSuccessEvent();
            return true;
        }
        emit DepositCallErrEvent();
        /// error handling
        handleError(data);
    }

    /// deposit via delegatecall, using the current contract msg.sender
    function depositDelegate(uint256 amount_) external returns (bool) {
        (bool flag, bytes memory data) = contractAddress.delegatecall(
            abi.encodeWithSignature("deposit(uint256)", amount_)
        );
        if (flag) {
            emit DepositCallSuccessEvent();
            return true;
        }
        /// error handling
        handleError(data);
    }

    // public functions
    // internal functions
    function handleError(bytes memory data) internal pure {
        // console.logBytes(data);
        //
        if (data.length == 0) {
            revert DepoistCallUnknowErr();
        }
        bytes4 receivedSelector = bytes4(data);
        bool matched = isUnauthorizedErr(receivedSelector);
        if (matched) {
            // data is 0xf128e5cf0000000000000000000000009fe46736679d2d9a65f0992f2272de9f3c7fa6e0
            assembly {
                // skips the length field
                revert(add(32, data), mload(data))
            }
        }
        matched = isAmountOutOfRangeErr(receivedSelector);
        if (matched) {
            assembly {
                // Look for revert reason and bubble it up if present
                // skips the length field, this revert will bubble the orignal error from call/delegatecall
                revert(add(32, data), mload(data))
            }
        }
        revert DepoistCallUnknowErr();
    }
    // private functions
}
