// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import {EventStorage} from "./events/EventStorage.sol";
import {Errors, Events} from "./shared/Monitoring.sol";

/// @notice @title Event represents every unique UPGRADEABLE event as part of the NFT marketplace
contract Event is EventStorage {
    /// @dev `_disableInitializers()` — prevents the proxied state of being reinitialized
    constructor(address payable _rngService) EventStorage(_rngService) {
        _disableInitializers();
    }

    /// @notice Buying functionality with an option for storing on-chain TICKET metadata
    function buyTicket() external payable virtual override onActiveSale {
        if (msg.value < ticketPrice) revert Errors.InsufficientBuyValue();
        _buyTicket();
    }

    /// @notice After the end of the event, makes a request to `RNGService`/DON
    function requestEventWinner() external virtual override afterActiveSale nonReentrant {
        RNG_SERVICE_.fundVrfConsumer();
        RNG_SERVICE_.requestRandomNumber("applyRewarding(uint256)");
        emit Events.EventWinnerRequested();
    }

    /// @notice Applies the rewarding *mechanism*
    function applyRewarding(uint256 _randomNumber) external virtual onlyRNGService {
        uint256 ticketIdWinner = _randomNumber % ticketId;
        address eventWinner = ownerOf(ticketIdWinner);
        _mint(eventWinner, ticketId);
        emit Events.EventWinner(eventWinner, ticketId);
    }

    /* ========================================== EVENT CREATOR ========================================= */

    /// @dev The intend of using assembly here is to skip the annoying memory copy on `.call()`
    /// @dev ::suggestion Allowed period of executing?
    function withdrawFunds() external payable virtual {
        if (msg.sender != eventCreator) revert Errors.MustBeEventCreator();
        bytes4 errorSelector = Errors.WithdrawFailed.selector;
        uint256 withdrawValue;
        assembly {
            let to := sload(eventCreator.slot)
            withdrawValue := selfbalance()
            let s := call(gas(), to, withdrawValue, 0, 0, 0, 0)
            if iszero(s) {
                mstore(0, errorSelector)
                revert(0, 4)
            }
        }
        emit Events.EventWithdraw(eventCreator, withdrawValue);
    }
}
