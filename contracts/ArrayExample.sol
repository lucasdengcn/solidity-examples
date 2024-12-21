// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

contract ArrayExample {
    // states
    // dynamic size
    uint256[] _arr;
    uint256[] _arr2 = [1, 2, 3];
    // Fixed size
    uint256[10] public arr3;

    //
    constructor() {}

    function valueAt(uint256 index) external view returns (uint256) {
        return _arr[index];
    }

    function length() external view returns (uint256) {
        return _arr.length;
    }

    function tail() external view returns (uint256) {
        return _arr[_arr.length - 1];
    }

    // if _arr is empty, will be panic 0x32
    function head() external view returns (uint256) {
        return _arr[0];
    }

    function push(uint256 value) external returns (uint256) {
        _arr.push(value);
        return _arr.length;
    }

    // if _arr is empty, will be panic 0x31
    function pop() external returns (uint256) {
        _arr.pop();
        return _arr.length;
    }

    function removeAt(uint256 index) external {
        delete _arr[index];
    }
}
