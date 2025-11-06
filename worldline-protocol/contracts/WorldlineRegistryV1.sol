// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IWorldlineRegistryV1.sol";

/// @dev Simple ownable pattern to avoid full OZ import in the example.
abstract contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

/// @dev Simple access control for "worldline writers".
abstract contract WorldlineAccess is Ownable {
    mapping(address => bool) public isWorldlineWriter;

    event WorldlineWriterSet(address indexed account, bool enabled);

    error NotWorldlineWriter();

    modifier onlyWorldlineWriter() {
        if (!isWorldlineWriter[msg.sender]) revert NotWorldlineWriter();
        _;
    }

    function setWorldlineWriter(address account, bool enabled) external onlyOwner {
        isWorldlineWriter[account] = enabled;
        emit WorldlineWriterSet(account, enabled);
    }
}

/// @title WorldlineRegistryV1
/// @notice Canonical registry of worldlines and their minimal metadata.
contract WorldlineRegistryV1 is IWorldlineRegistryV1, WorldlineAccess {
    mapping(bytes32 => MinimalWorldlineMeta) internal _meta;
    mapping(bytes32 => bool) public exists;

    error WorldlineAlreadyExists();
    error WorldlineNotFound();

    /// @notice Register a new worldline. Should only be called by trusted adapters/contracts.
    function createWorldline(
        bytes32 worldlineId,
        bytes32 classId,
        bytes32 anchorRef,
        bytes   calldata initialStateCid
    ) external onlyWorldlineWriter {
        if (exists[worldlineId]) revert WorldlineAlreadyExists();

        _meta[worldlineId] = MinimalWorldlineMeta({
            classId: classId,
            anchorRef: anchorRef,
            createdAt: uint64(block.timestamp)
        });
        exists[worldlineId] = true;

        emit WorldlineCreated(worldlineId, classId, anchorRef, initialStateCid);
    }

    /// @notice Emit an update event for an existing worldline.
    function updateWorldline(
        bytes32 worldlineId,
        uint8   fieldMask,
        bytes   calldata newStateCid
    ) external onlyWorldlineWriter {
        if (!exists[worldlineId]) revert WorldlineNotFound();
        emit WorldlineUpdated(worldlineId, fieldMask, newStateCid);
    }

    /// @notice Record an entanglement between two worldlines.
    function entangleWorldlines(
        bytes32 sourceWorldline,
        bytes32 targetWorldline,
        bytes32 relType
    ) external onlyWorldlineWriter {
        if (!exists[sourceWorldline] || !exists[targetWorldline]) revert WorldlineNotFound();
        emit WorldlineEntangled(sourceWorldline, targetWorldline, relType);
    }

    function getWorldlineMeta(bytes32 worldlineId)
        external
        view
        override
        returns (MinimalWorldlineMeta memory)
    {
        if (!exists[worldlineId]) revert WorldlineNotFound();
        return _meta[worldlineId];
    }
}
