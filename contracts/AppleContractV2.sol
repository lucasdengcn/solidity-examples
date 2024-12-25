// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./AppleContract.sol";

/// @custom:oz-upgrades-from AppleContract
contract AppleContractV2 is AppleContract {
    //
    // use reversed slot
    uint256 public price1;

    function initializeV2(address owner) public reinitializer(20) {
        price1 = 20;
    }

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual override returns (string memory) {
        return "2.0.0";
    }

    function changePrice(uint256 newPrice) public virtual override returns (bool) {
        uint256 priceOld = price1;
        price1 = newPrice;
        emit PriceChangedSuccess(newPrice, priceOld);
        return true;
    }
}
