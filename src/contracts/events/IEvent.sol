// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

interface IEvent {
    function initialize(
        string calldata _eventData,
        string calldata name_,
        string calldata symbol_,
        address _eventCreator,
        uint256 _saleStart,
        uint256 _saleEnd,
        uint256 _ticketPrice
    ) external;

    function buyTicket() external payable;

    function requestEventWinner() external;

    function withdrawFunds() external payable;
}
