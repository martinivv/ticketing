// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/// @title EventBeacon represents the beacon that all proxies will refer to for the current implementation
/// @dev ::suggestion Implement a multi-signature wallet to mitigate the SPOF vulnerability
/// @dev ::suggestion An alerting mechanism before changing the implementation?
contract EventBeacon is UpgradeableBeacon {
    constructor(address implementation_, address initialOwner_) UpgradeableBeacon(implementation_, initialOwner_) {}
}
