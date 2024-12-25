// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "./YYTokenContractV1UUPS.sol";

/// @custom:oz-upgrades-from YYTokenContractV1UUPS
contract YYTokenContractV2UUPS is YYTokenContractV1UUPS {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual override returns (string memory) {
        return "2.0.0";
    }

    function reInitialize(address initialOwner) public reinitializer(2) {}
}
