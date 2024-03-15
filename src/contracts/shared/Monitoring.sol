// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

/// @notice Events used throughout the protocol
library Events {
    event EventCreated(address indexed eventCreator, address indexed proxyAddress);
    event TicketBought(address indexed user, uint256 indexed ticketId);
    event EventWinnerRequested();
    event EventWinner(address indexed user, uint256 indexed ticketId);
    event EventWithdraw(address indexed eventCreator, uint256 indexed value);
    event BaseImplementationChanged(address indexed previous, address indexed new_);
}

/// @notice Errors used throughout the protocol
/// @dev ::sugestion Consider creating more robust error naming if your project requires it
library Errors {
    error InvalidIO();
    error SaleNotActive();
    error SaleIsActive();
    error NotRNGService();
    error InsufficientBuyValue();
    error ProxyAlreadyPresent();
    error RandomnessNotApplied();
    error MustBeEventCreator();
    error WithdrawFailed();
}
