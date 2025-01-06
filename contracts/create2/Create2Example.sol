// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Create2.sol";

import "../GldToken.sol";

contract Create2Example {
    event ContractDeployed(address newContractAddress);

    // generic deploy

    function deployContract(bytes32 salt, bytes memory bytecode) external {
        address newContractAddress = Create2.deploy(0, salt, bytecode);
        emit ContractDeployed(newContractAddress);
    }

    function computeContractAddress(
        bytes32 salt,
        bytes memory bytecode,
        address deployer
    ) external pure returns (address) {
        return Create2.computeAddress(salt, keccak256(bytecode), deployer);
    }

    // for a specific token

    function computeTokenAddress(bytes32 salt, uint8 id) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(type(GldToken).creationCode, abi.encode(id));
        return Create2.computeAddress(salt, keccak256(bytecode), msg.sender);
    }

    function deployToken(bytes32 salt, uint8 id) external returns (address) {
        //
        bytes memory bytecode = abi.encodePacked(type(GldToken).creationCode, abi.encode(id));
        //
        address result = Create2.deploy(0, salt, bytecode);
        return result;
    }
}
