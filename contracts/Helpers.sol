// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

contract Helpers {
    // public functions
    function storageLocation(string memory namespaceId) public pure returns (bytes32) {
        bytes32 location = keccak256(abi.encode(uint256(keccak256(bytes(namespaceId))) - 1)) & ~bytes32(uint256(0xff));
        return location;
    }

    function generateCreate2Salt() public view returns (bytes32 salt) {
        unchecked {
            salt = keccak256(
                abi.encode(
                    // We don't use `block.number - 256` (the maximum value on the EVM) to accommodate
                    // any chains that may try to reduce the amount of available historical block hashes.
                    // We also don't subtract 1 to mitigate any risks arising from consecutive block
                    // producers on a PoS chain. Therefore, we use `block.number - 32` as a reasonable
                    // compromise, one we expect should work on most chains, which is 1 epoch on Ethereum
                    // mainnet. Please note that if you use this function between the genesis block and block
                    // number 31, the block property `blockhash` will return zero, but the returned salt value
                    // `salt` will still have a non-zero value due to the hashing characteristic and the other
                    // remaining properties.
                    blockhash(block.number - 32),
                    block.coinbase,
                    block.number,
                    block.timestamp,
                    block.prevrandao,
                    block.chainid,
                    msg.sender
                )
            );
        }
    }
}
