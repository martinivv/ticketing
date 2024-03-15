// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Errors, Events} from "./shared/Monitoring.sol";
import {IEvent} from "./events/IEvent.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/// @title Marketplace provides an administrative panel for the marketplace
contract Marketplace is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The address of the beacon, managing the proxies
    address public immutable beaconAddr;

    /// @notice All deployed events in an extensive type structure
    EnumerableSet.AddressSet private _allEvents;

    /* ================================================ METHODS =============================================== */

    constructor(address _beacon, address initialOwner_) Ownable(initialOwner_) {
        beaconAddr = _beacon;
    }

    /// @notice Creates new events
    /// @param eventData_ The URI pointing to off-chain event data
    /// @param name_ The name of the NFT tickets for sale
    /// @param symbol_ The symbol of the NFT tickets for sale
    /// @param saleStart_ The block number at which the ticket sale period starts
    /// @param saleEnd_ The block number at which the ticket sale period ends
    /// @param ticketPrice_ Specifies the ticket price
    function createEvent(
        string calldata eventData_,
        string calldata name_,
        string calldata symbol_,
        uint256 saleStart_,
        uint256 saleEnd_,
        uint256 ticketPrice_
    ) external {
        if (
            bytes(eventData_).length == 0 ||
            bytes(name_).length == 0 ||
            bytes(symbol_).length == 0 ||
            saleStart_ < block.number ||
            saleEnd_ <= saleStart_ ||
            ticketPrice_ == 0
        ) revert Errors.InvalidIO();

        address newProxyAddr = _deployProxy(eventData_, name_, symbol_, msg.sender, saleStart_, saleEnd_, ticketPrice_);
        emit Events.EventCreated(msg.sender, newProxyAddr);
    }

    /* ================================================= VIEW ================================================= */

    /// @notice Returns all deployed events
    function getAllEvents() public view returns (address[] memory out) {
        uint256 len = _allEvents.length();
        out = new address[](len);
        for (uint256 i; i < len; i++) {
            out[i] = _allEvents.at(i);
        }
    }

    /* =========================================== INTERNAL&PRIVATE =========================================== */

    /// @notice Handles the deployment of the event proxy
    function _deployProxy(
        string calldata eventData_,
        string calldata name_,
        string calldata symbol_,
        address eventCreator_,
        uint256 saleStart_,
        uint256 saleEnd_,
        uint256 ticketPrice_
    ) private returns (address newProxyAddr) {
        bytes memory encodedData = abi.encodeWithSelector(
            IEvent.initialize.selector,
            eventData_,
            name_,
            symbol_,
            eventCreator_,
            saleStart_,
            saleEnd_,
            ticketPrice_
        );
        newProxyAddr = address(new BeaconProxy(beaconAddr, encodedData));
        bool ok = _allEvents.add(newProxyAddr);
        if (!ok) revert Errors.ProxyAlreadyPresent();
    }
}
