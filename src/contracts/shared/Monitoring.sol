// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

library Events {
    event ProxyDeployed(address indexed eventCreator, address indexed proxyAddress);
    event TicketBought(address indexed user, uint256 indexed ticketId);
    event EventWinnerRequested();
    event EventWinner(address indexed user, uint256 indexed ticketId);
    event EventWithdraw(address indexed eventCreator, uint256 value);
    event BaseImplementationChanged(address indexed previous, address indexed new_);
}

/// @dev Consider creating more robust error naming if your project's style requires it
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
