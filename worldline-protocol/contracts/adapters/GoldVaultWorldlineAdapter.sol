// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IWorldlineRegistryV1.sol";

interface IGoldVault {
    struct VaultPosition {
        address owner;
        uint256 amountOz;
        bytes32 skrHash;      // hash to SKR / docs
        bool    active;
    }

    function getPosition(uint256 positionId) external view returns (VaultPosition memory);
}

/// @title GoldVaultWorldlineAdapter
/// @notice Bridges gold vault positions into worldlines.
contract GoldVaultWorldlineAdapter {
    IWorldlineRegistryV1 public immutable registry;
    IGoldVault           public immutable vault;

    bytes32 public immutable CLASS_ID; // e.g. keccak256("RWA.GOLD.VAULT_V1");

    // positionId => worldlineId
    mapping(uint256 => bytes32) public positionWorldline;

    event GoldVaultWorldlineRegistered(uint256 indexed positionId, bytes32 worldlineId);

    constructor(address registry_, address vault_, bytes32 classId_) {
        registry = IWorldlineRegistryV1(registry_);
        vault    = IGoldVault(vault_);
        CLASS_ID = classId_;
    }

    /// @notice Derive a worldlineId for a given position.
    function deriveWorldlineId(uint256 positionId, bytes32 anchorRef) public pure returns (bytes32) {
        // simple deterministic derivation; you can choose any scheme, but keep it stable.
        return keccak256(abi.encodePacked(
            bytes32("RWA.GOLD.VAULT_V1"),
            anchorRef,
            uint256(7777), // origin chain id or configurable
            positionId
        ));
    }

    /// @notice Called (by an admin, factory, or hook) when a new vault position is created
    ///         and should be worldline-tracked.
    /// @param positionId      The vault position id.
    /// @param anchorRef       Hash of SKR + certs + docs.
    /// @param initialStateCid Off-chain CID with initial full worldline state.
    function registerPositionWorldline(
        uint256 positionId,
        bytes32 anchorRef,
        bytes   calldata initialStateCid
    ) external {
        // In practice you might restrict this (only vault or owner).
        require(positionWorldline[positionId] == bytes32(0), "already registered");

        bytes32 worldlineId = deriveWorldlineId(positionId, anchorRef);

        positionWorldline[positionId] = worldlineId;

        registry.createWorldline(
            worldlineId,
            CLASS_ID,
            anchorRef,
            initialStateCid
        );

        emit GoldVaultWorldlineRegistered(positionId, worldlineId);
    }

    /// @notice Example hook when position phase changes (e.g. locked as collateral).
    /// @dev Off-chain process should compute a new state blob, pin to IPFS, and pass CID here.
    function onPositionPhaseChange(
        uint256 positionId,
        uint8   fieldMask,
        bytes   calldata newStateCid
    ) external {
        // In production: restrict to trusted callers (vault/collateral manager).
        bytes32 worldlineId = positionWorldline[positionId];
        require(worldlineId != bytes32(0), "no worldline");

        registry.updateWorldline(worldlineId, fieldMask, newStateCid);
    }

    /// @notice Example entanglement when this vault is backing a stablecoin pool.
    function entangleWithStablecoinPool(
        uint256 positionId,
        bytes32 stablecoinPoolWorldlineId,
        bytes32 relType // e.g. keccak256("BACKS")
    ) external {
        // Restrict in real code.
        bytes32 worldlineId = positionWorldline[positionId];
        require(worldlineId != bytes32(0), "no worldline");

        registry.entangleWorldlines(worldlineId, stablecoinPoolWorldlineId, relType);
    }
}
