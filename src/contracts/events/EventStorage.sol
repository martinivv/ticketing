// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IEvent} from "./IEvent.sol";
import {RNGService} from "./RNGService.sol";
import {Errors, Events} from "../shared/Monitoring.sol";

/// @notice @title EventStorage provides the storage layout saved on the proxy with some abstract-controlling methods
abstract contract EventStorage is ERC721URIStorageUpgradeable, ReentrancyGuardUpgradeable, IEvent {
    RNGService public immutable RNG_SERVICE_;

    /// @notice Off-chain source of data
    string public eventIdentifier;
    address public eventCreator;
    uint256 public saleStart;
    uint256 public saleEnd;
    uint256 public ticketPrice;

    uint256 public ticketId;
    // Consider packing the storage variables in fewer storage slots; by using smaller sizes, DIFFERENT type

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

    /// @notice Sets the setup of the proxy state
    /// @dev `initializer` modifier — prevents the proxy state to be reinitialized
    /// @dev By using `_init()` we're preventing some potential inheritance-chain related
    /// problems in OZ's implementations
    function initialize(
        string calldata _eventIdentifier,
        string calldata name_,
        string calldata symbol_,
        address _eventCreator,
        uint256 _saleStart,
        uint256 _saleEnd,
        uint256 _ticketPrice
    ) external override initializer {
        __ERC721_init(name_, symbol_);
        __ReentrancyGuard_init();

        eventIdentifier = _eventIdentifier;
        eventCreator = _eventCreator;
        saleStart = _saleStart;
        saleEnd = _saleEnd;
        ticketPrice = _ticketPrice;
    }

    /// @dev Consider implementing logic for storing on-chain TICKET metadata
    function _buyTicket() internal {
        _mint(msg.sender, ticketId);
        // _setTokenURI(ticketId, "");
        ticketId++;
        emit Events.TicketBought(msg.sender, ticketId);
    }

    function _isActive() internal view returns (bool res) {
        uint256 currentBlock = block.number;
        res = currentBlock >= saleStart && currentBlock <= saleEnd;
    }

    /// @dev This empty reserved space is put in place to allow future versions to add new
    /// variables without shifting down storage in the inheritance chain
    uint256[45] private __gap;
}
