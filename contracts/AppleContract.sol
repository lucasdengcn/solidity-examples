// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract AppleContract is Initializable, ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    //
    uint256 public appleCount;
    uint256 public price0;

    // storage slot reversation
    uint256[30] __gap_slot;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) public virtual initializer {
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
        appleCount = 100;
        price0 = 10;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    event PriceChangedSuccess(address indexed editor, uint256 indexed newPrice, uint256 indexed oldPrice);

    function changePrice(uint256 newPrice) public virtual returns (bool) {
        uint256 priceOld = price0;
        price0 = newPrice;
        emit PriceChangedSuccess(_msgSender(), newPrice, priceOld);
        return true;
    }
}
