// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Worldline Registry V1 - Core event + metadata interface
interface IWorldlineRegistryV1 {
    /// @notice Emitted when a new worldline is registered.
    /// @param worldlineId  Unique identifier of the worldline.
    /// @param classId      Identifier of the worldline class (e.g. RWA.GOLD.VAULT_V1).
    /// @param anchorRef    Anchor hash tying the worldline to real-world/legal docs.
    /// @param initialStateCid  Off-chain CID (IPFS/Arweave) of initial state blob.
    event WorldlineCreated(
        bytes32 indexed worldlineId,
        bytes32 indexed classId,
        bytes32 indexed anchorRef,
        bytes   initialStateCid
    );

    /// @notice Emitted when a worldline's state is updated.
    /// @dev fieldMask: bit flags for which parts changed:
    ///      1 = frequency, 2 = polarization, 4 = phase, 8 = entanglements.
    /// @param worldlineId  Identifier of the worldline.
    /// @param fieldMask    Bitmask of updated fields.
    /// @param newStateCid  CID of new canonical state blob.
    event WorldlineUpdated(
        bytes32 indexed worldlineId,
        uint8   fieldMask,
        bytes   newStateCid
    );

    /// @notice Emitted when an explicit relationship between two worldlines is recorded.
    /// @param sourceWorldline  The source worldline.
    /// @param targetWorldline  The target worldline.
    /// @param relType          Relationship type (e.g. keccak256("COLLATERAL_FOR")).
    event WorldlineEntangled(
        bytes32 indexed sourceWorldline,
        bytes32 indexed targetWorldline,
        bytes32 relType
    );

    struct MinimalWorldlineMeta {
        bytes32 classId;
        bytes32 anchorRef;
        uint64  createdAt;
    }

    /// @notice Returns minimal metadata for a given worldline.
    function getWorldlineMeta(bytes32 worldlineId)
        external
        view
        returns (MinimalWorldlineMeta memory);
}
