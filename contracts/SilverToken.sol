// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./GldToken.sol";

contract SilverToken is ERC20Permit {
    // using SafeERC20 for IERC20;
    address public contractOwner;
    address public cTokenAddress;

    //
    constructor(address gldTokenAddress) ERC20("Silver", "SIL") ERC20Permit("Silver") {
        cTokenAddress = gldTokenAddress;
        contractOwner = msg.sender;
    }

    // external functions
    function mint(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        console.log("mint amount:", amount, msg.sender);
        try
            GldToken(cTokenAddress).tryPermitTransfer(msg.sender, address(this), amount, deadline, v, r, s)
        {} catch Error(string memory message) {
            console.log("Error: ", message);
        } catch Panic(uint errorCode) {
            console.log("Panic: ", errorCode);
        } catch (bytes memory err) {
            console.log("Reverted Error: ");
            assembly {
                // skips the length field
                revert(add(err, 32), mload(err))
            }
            // bytes4 selector = bytes4(err);
            // if (selector == ERC2612InvalidSigner.selector) {
            //     (bytes4 _selector, bytes32 _signer, bytes32 _owner) = _parsePermitErr(err);
            //     console.log("ERC2612InvalidSigner: signer, owner");
            //     console.logBytes32(_signer);
            //     console.logBytes32(_owner);
            //     console.logBytes4(_selector);
            // } else {
            //     console.logBytes(err);
            // }
        }
    }

    // internal functions
    function _parsePermitErr(bytes memory data) internal pure returns (bytes4 selector, bytes32 signer, bytes32 owner) {
        assembly {
            selector := mload(add(data, 32))
            signer := mload(add(data, 36))
            owner := mload(add(data, 68))
        }
    }
}
