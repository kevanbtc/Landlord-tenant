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

/// @title WorldlineClassRegistry
/// @notice Registry for WorldlineClass definitions: phases, transitions, allowed entanglements.
contract WorldlineClassRegistry is Ownable {
    struct PhaseTransition {
        uint8 from;
        uint8 to;
    }

    struct ClassConfig {
        string name;
        uint8[] allowedPhases;
        bytes32[] allowedRelTypes;
        PhaseTransition[] transitions;
        bool exists;
    }

    mapping(bytes32 => ClassConfig) public classes;

    event ClassRegistered(bytes32 indexed classId, string name);
    event ClassUpdated(bytes32 indexed classId);

    error ClassAlreadyExists();
    error ClassNotFound();
    error InvalidTransition();

    /// @notice Register a new class with its config.
    function registerClass(
        bytes32 classId,
        string calldata name,
        uint8[] calldata allowedPhases,
        bytes32[] calldata allowedRelTypes,
        PhaseTransition[] calldata transitions
    ) external onlyOwner {
        if (classes[classId].exists) revert ClassAlreadyExists();

        classes[classId] = ClassConfig({
            name: name,
            allowedPhases: allowedPhases,
            allowedRelTypes: allowedRelTypes,
            transitions: transitions,
            exists: true
        });

        emit ClassRegistered(classId, name);
    }

    /// @notice Update an existing class config.
    function updateClass(
        bytes32 classId,
        string calldata name,
        uint8[] calldata allowedPhases,
        bytes32[] calldata allowedRelTypes,
        PhaseTransition[] calldata transitions
    ) external onlyOwner {
        if (!classes[classId].exists) revert ClassNotFound();

        classes[classId] = ClassConfig({
            name: name,
            allowedPhases: allowedPhases,
            allowedRelTypes: allowedRelTypes,
            transitions: transitions,
            exists: true
        });

        emit ClassUpdated(classId);
    }

    /// @notice Check if a phase transition is allowed for a class.
    function isTransitionAllowed(bytes32 classId, uint8 from, uint8 to) external view returns (bool) {
        if (!classes[classId].exists) return false;

        PhaseTransition[] memory trans = classes[classId].transitions;
        for (uint i = 0; i < trans.length; i++) {
            if (trans[i].from == from && trans[i].to == to) {
                return true;
            }
        }
        return false;
    }

    /// @notice Check if a relType is allowed for a class.
    function isRelTypeAllowed(bytes32 classId, bytes32 relType) external view returns (bool) {
        if (!classes[classId].exists) return false;

        bytes32[] memory rels = classes[classId].allowedRelTypes;
        for (uint i = 0; i < rels.length; i++) {
            if (rels[i] == relType) {
                return true;
            }
        }
        return false;
    }
}
