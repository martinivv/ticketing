// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import {EventStorage} from "./events/EventStorage.sol";
import {Errors, Events} from "./shared/Monitoring.sol";

/// @title Event represents every unique UPGRADEABLE event as part of the NFT marketplace
contract Event is EventStorage {
    /// @dev `_disableInitializers()` — prevents the proxied state of being reinitialized
    constructor(address payable _rngService) EventStorage(_rngService) {
        _disableInitializers();
    }

    /// @notice Buying functionality on a fixed sale period
    /// @dev Using `nonReentrant` to prevent the re-entrancy attack vector of `_safeMint`
    function buyTicket() external payable virtual onActiveSale nonReentrant {
        if (msg.value < ticketPrice) revert Errors.InsufficientBuyValue();
        _buyTicket();
    }

    /// @notice After the end of the sale period, makes a request for
    /// a fair and verifiable random number
    function requestEventWinner() external virtual afterActiveSale {
        RNG_SERVICE_.fundVrfConsumer();
        RNG_SERVICE_.requestRandomNumber("applyRewarding(uint256)");
        emit Events.EventWinnerRequested();
    }

    /// @notice Applies the rewarding *mechanism*
    function applyRewarding(uint256 _randomNumber) external virtual {
        if (msg.sender != address(RNG_SERVICE_)) revert Errors.NotRNGService();
        uint256 ticketIdWinner = _randomNumber % nextTicketId;
        address eventWinner = ownerOf(ticketIdWinner);
        _safeMint(eventWinner, nextTicketId);
        emit Events.EventWinner(eventWinner, ticketIdWinner);
    }

    /* ========================================== EVENT CREATOR ========================================= */

    /// @notice Enables event creators to withdraw the collected funds
    /// @dev Using assembly here avoids memory copying on `.call()`
    /// @dev ::suggestion Allowed period of executing?
    function withdrawFunds() external payable virtual nonReentrant {
        if (msg.sender != eventCreator) revert Errors.MustBeEventCreator();
        uint256 withdrawValue = address(this).balance;
        assembly {
            let s := call(gas(), sload(eventCreator.slot), withdrawValue, 0, 0, 0, 0)
            if iszero(s) {
                // `WithdrawFailed()`'s selector
                mstore(0, 0x750b219c)
                revert(0, 4)
            }
        }
        emit Events.EventWithdraw(eventCreator, withdrawValue);
    }
}
