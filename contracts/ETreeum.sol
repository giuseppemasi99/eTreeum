// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

contract ETreeum {
    /** The originator of this contract */
    address payable public minter;

    constructor() {
        minter = payable(msg.sender);
    }

}
