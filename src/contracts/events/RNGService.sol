// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import {VRFV2WrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/VRFV2WrapperConsumerBase.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Errors} from "../shared/Monitoring.sol";

/// @title RNGService provides independent Random Number Generation service
contract RNGService is VRFV2WrapperConsumerBase {
    using SafeERC20 for IERC20;

    /* ::suggestion Place for state controllers, parameters, which can then be used somewhere else.
    Records of: `requestId => randomNumber`, `uint256 => callbackSignature`, etc. */

    // ======== Chainlink VRF ========
    uint32 private constant CALLBACK_GAS_LIMIT = 100_000;
    /// @dev The value should be high enough to avoid reorg attacks
    uint16 private constant REQ_CONFIRMATIONS = 3;
    uint32 private constant REQ_WORDS = 1;
    IERC20 public immutable LINK_TOKEN_;

    // ======== Request-Response controllers ========
    mapping(uint256 => address) private _requests;
    mapping(uint256 => string) private _callbacks;

    /* ================================================ METHODS =============================================== */

    constructor(
        address linkTokenAddr_,
        address vrfV2WrapperAddr_
    ) VRFV2WrapperConsumerBase(linkTokenAddr_, vrfV2WrapperAddr_) {
        if (linkTokenAddr_ == address(0)) revert Errors.InvalidIO();
        LINK_TOKEN_ = IERC20(linkTokenAddr_);
    }

    /// @notice Enables receiving funds
    receive() external payable {}

    /// @notice Funds the Chainlink VRF request
    /// @dev ::suggestion Event monitoring?
    function fundVrfConsumer() external {
        uint256 fee = 0.25 ether;
        LINK_TOKEN_.safeTransferFrom(msg.sender, address(this), fee);
    }

    /// @notice Makes a Chainlink VRF request
    /// @dev ::suggestion Consider implementing a more robust RNG process —
    /// e.g., by using different third-party oracle providers
    function requestRandomNumber(string calldata _callbackSignature) external {
        uint256 requestId = requestRandomness(CALLBACK_GAS_LIMIT, REQ_CONFIRMATIONS, REQ_WORDS);
        _requests[requestId] = msg.sender;
        _callbacks[requestId] = _callbackSignature;
    }

    /* =============================================== RESPONSES ============================================== */

    /// @notice Called by the Chainlink oracle service with the generated randomness
    /// @dev ::suggestion Assembly?
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        (bool ok, ) = _requests[_requestId].call(abi.encodeWithSignature(_callbacks[_requestId], _randomWords[0]));
        if (!ok) revert Errors.RandomnessNotApplied();
    }
}
