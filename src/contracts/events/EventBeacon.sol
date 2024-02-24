// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/// @notice @title EventBeacon represents the beacon that all proxies will refer to for the CURRENT implementation
contract EventBeacon is UpgradeableBeacon {
    constructor(address implementation_, address initialOwner_) UpgradeableBeacon(implementation_, initialOwner_) {}
}
