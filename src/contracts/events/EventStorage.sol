// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IEvent} from "./IEvent.sol";
import {RNGService} from "./RNGService.sol";
import {Errors, Events} from "../shared/Monitoring.sol";

/// @dev @title EventStorage provides the storage layout saved on the proxy with some abstract-controlling methods
abstract contract EventStorage is ERC721URIStorageUpgradeable, ReentrancyGuardUpgradeable, IEvent {
    RNGService public immutable RNG_SERVICE_;

    /// @notice Source of the off-chain stored data (e.g., IPFS)
    string public eventData;
    /// @notice 👇 are variables related to the current event
    /// @dev ::suggestion Consider packing the storage variables in fewer storage slots; by using smaller sizes, DIFFERENT type
    address public eventCreator;
    uint256 public saleStart;
    uint256 public saleEnd;
    uint256 public ticketPrice;
    uint256 public nextTicketId;

    /* =============================================== ABSTRACT =============================================== */

    modifier onActiveSale() {
        if (!_isActive()) revert Errors.SaleNotActive();
        _;
    }

    modifier afterActiveSale() {
        if (_isActive()) revert Errors.SaleIsActive();
        _;
    }

    modifier onlyRNGService() {
        if (msg.sender != address(RNG_SERVICE_)) revert Errors.NotRNGService();
        _;
    }

    /// @dev Setting immutable variables in an upgradeable contract is safe and can lead to significant gas savings
    constructor(address payable _rngService) {
        RNG_SERVICE_ = RNGService(_rngService);
    }

    /// @notice Setups the event
    /// @dev `initializer` modifier — prevents the proxy state to be reinitialized
    /// @dev By using `_init()` we're preventing some potential inheritance-chain related
    /// problems in OZ's implementations
    function initialize(
        string calldata _eventData,
        string calldata name_,
        string calldata symbol_,
        address _eventCreator,
        uint256 _saleStart,
        uint256 _saleEnd,
        uint256 _ticketPrice
    ) external override initializer {
        __ERC721_init(name_, symbol_);
        __ReentrancyGuard_init();

        eventData = _eventData;
        eventCreator = _eventCreator;
        saleStart = _saleStart;
        saleEnd = _saleEnd;
        ticketPrice = _ticketPrice;
    }

    /// @dev ::suggestion Consider implementing logic for storing on-chain ticket metadata
    function _buyTicket() internal {
        _mint(msg.sender, nextTicketId);
        // _setTokenURI(nextTicketId, "{...}");
        emit Events.TicketBought(msg.sender, nextTicketId);
        nextTicketId++;
    }

    /// @notice Checks if the event is currently active
    function _isActive() internal view returns (bool out) {
        out = block.number >= saleStart && block.number <= saleEnd;
    }

    /// @dev This empty reserved space is put in place to allow future versions to add new
    /// variables without shifting down storage in the inheritance chain
    uint256[44] private __gap;
}
