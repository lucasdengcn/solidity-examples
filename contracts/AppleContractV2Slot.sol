// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:oz-upgrades-from AppleContract
contract AppleContractV2Slot is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // defined in V1
    uint256 public appleCount;
    uint256 public price0;
    // new variable in V2
    uint256 public price1;
    // storage slot reversation
    uint256[29] __gap_slot;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initializeV2(address owner) public virtual reinitializer(2) {
        // just need to initialize new variables.
        price1 = 20;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual returns (string memory) {
        return "2.0.0";
    }

    function changePrice(uint256 newPrice) public virtual returns (uint256) {
        price1 = newPrice;
        return price1;
    }
}
