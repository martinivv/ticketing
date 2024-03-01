// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import {VRFV2WrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/VRFV2WrapperConsumerBase.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Errors, Events} from "../shared/Monitoring.sol";

/// @notice @title RNGService provides independent Random Number Generation service
contract RNGService is VRFV2WrapperConsumerBase, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // *Hardcoded values*
    uint32 private constant CALLBACK_GAS_LIMIT = 100_000;
    uint16 private constant REQ_CONFIRMATIONS = 3;
    uint32 private constant REQ_WORDS = 1;

    address public immutable linkTokenAddr;

    /* ::suggestion Place for state controllers, parameters, which can then be used somewhere else.
    Records of: `requestId => randomNumber`, `uint256 => callbackSignature`, etc. */

    mapping(uint256 => address) private _requests;
    mapping(uint256 => string) private _callbacks;

    /* ================================================ METHODS =============================================== */

    constructor(
        address linkTokenAddr_,
        address vrfV2WrapperAddr_
    ) VRFV2WrapperConsumerBase(linkTokenAddr_, vrfV2WrapperAddr_) {
        if (linkTokenAddr_ == address(0)) revert Errors.InvalidIO();
        linkTokenAddr = linkTokenAddr_;
    }

    receive() external payable {}

    /// @dev ::suggestion Event monitoring?
    function fundVrfConsumer() external {
        uint256 fee = 0.25 ether;
        IERC20(linkTokenAddr).safeTransferFrom(msg.sender, address(this), fee);
    }

    /// @dev Re-entering may cause inaccuracies
    /// @dev ::suggestion Consider implementing a more robust RNG process — for example, by using different third-party oracle providers
    function requestRandomNumber(string calldata _callbackSignature) external nonReentrant {
        uint256 requestId = requestRandomness(CALLBACK_GAS_LIMIT, REQ_CONFIRMATIONS, REQ_WORDS);
        _requests[requestId] = msg.sender;
        _callbacks[requestId] = _callbackSignature;
    }

    /* =============================================== RESPONSES ============================================== */

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        (bool ok, ) = _requests[_requestId].call(abi.encodeWithSignature(_callbacks[_requestId], _randomWords[0]));
        if (!ok) revert Errors.RandomnessNotApplied();
    }
}
