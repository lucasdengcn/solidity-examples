// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract YYTokenContractV1UUPS is Initializable, OwnableUpgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {
    // stat
    /// @custom:storage-location erc7201:YYTokenContract.storage.Stat
    struct StatStorage {
        uint128 field1;
        uint128 field2;
        uint128 field3;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // initialize function
    function initialize(address initialOwner) public initializer {
        __ERC20_init("YYToken", "YYT");
        __Ownable_init(initialOwner);
        __ERC20Permit_init("YYToken");
        __UUPSUpgradeable_init();
        super._mint(msg.sender, 1000000);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // storage location
    // keccak256(abi.encode(uint256(keccak256("YYTokenContract.storage.Stat")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant StatStorageLocation = 0x03b22522e98749f64bb4a250a5ecb534d973f21b8397292650bcdf1d06414a00;

    // storage getter
    function _getStatStorage() private pure returns (StatStorage storage $) {
        assembly {
            $.slot := StatStorageLocation
        }
    }

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    // events
    event YYStatChanged(uint128 field1, uint128 field2, uint128 field3);

    // setter
    function incrementViewCount() public {
        StatStorage storage $ = _getStatStorage();
        $.field3 += 1;
        //
        emit YYStatChanged($.field1, $.field2, $.field3);
    }

    function incrementUpdateCount() public {
        StatStorage storage $ = _getStatStorage();
        $.field2 += 1;
        //
        emit YYStatChanged($.field1, $.field2, $.field3);
    }

    function incrementCreateCount() public {
        StatStorage storage $ = _getStatStorage();
        $.field1 += 1;
        //
        emit YYStatChanged($.field1, $.field2, $.field3);
    }

    // return stat detail in struct.
    function getStatDetail() public pure returns (StatStorage memory stat) {
        StatStorage storage $ = _getStatStorage();
        return $;
    }

    // upgrateEvent
    event YYTokenContractUpgrated(string version);

    function upgratePostEvent() public virtual {
        emit YYTokenContractUpgrated(version());
    }
}
