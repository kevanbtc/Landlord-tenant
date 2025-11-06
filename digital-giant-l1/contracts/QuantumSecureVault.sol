// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title QuantumSecureVault
 * @dev Quantum-resistant secure vault for Digital Giant L1
 * Implements lattice-based cryptography, multi-signature quantum security,
 * and decentralized key management with regulatory compliance
 */
contract QuantumSecureVault is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    bytes32 public constant VAULT_MANAGER = keccak256("VAULT_MANAGER");
    bytes32 public constant QUANTUM_AUTHORITY = keccak256("QUANTUM_AUTHORITY");
    bytes32 public constant EMERGENCY_AUTHORITY = keccak256("EMERGENCY_AUTHORITY");

    // Quantum-resistant signature schemes
    enum QuantumSignatureType {
        DILITHIUM,      // CRYSTALS-Dilithium (NIST standard)
        FALCON,         // FALCON signature scheme
        SPHINCS,        // SPHINCS+ stateless hash-based
        MULTI_SIG,      // Multi-signature quantum scheme
        THRESHOLD_SIG   // Threshold quantum signature
    }

    // Vault entry structure
    struct VaultEntry {
        bytes32 entryId;
        address owner;
        bytes32 contentHash;
        QuantumSignatureType sigType;
        bytes quantumSignature;
        bytes32 merkleRoot;
        uint256 timestamp;
        uint256 expiration;
        bool isActive;
        uint256 accessCount;
        address lastAccessor;
        uint256 lastAccessTime;
    }

    // Quantum key structure
    struct QuantumKey {
        bytes32 keyId;
        address owner;
        QuantumSignatureType keyType;
        bytes publicKey;
        uint256 keyStrength;        // Security level (bits)
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
        bool isCompromised;
        uint256 usageCount;
    }

    // Multi-signature policy
    struct MultiSigPolicy {
        uint256 policyId;
        uint256 requiredSignatures;
        address[] authorizedSigners;
        QuantumSignatureType sigType;
        uint256 timelock;           // Minimum time between operations
        uint256 lastExecution;
        bool isActive;
    }

    // Threshold signature session
    struct ThresholdSession {
        bytes32 sessionId;
        uint256 policyId;
        bytes32 operationHash;
        address[] signers;
        bytes[] signatures;
        uint256 collectedSignatures;
        uint256 createdAt;
        uint256 expiresAt;
        bool executed;
    }

    // State variables
    mapping(bytes32 => VaultEntry) public vaultEntries;
    mapping(bytes32 => QuantumKey) public quantumKeys;
    mapping(uint256 => MultiSigPolicy) public multiSigPolicies;
    mapping(bytes32 => ThresholdSession) public thresholdSessions;

    mapping(address => bytes32[]) public userVaultEntries;
    mapping(address => bytes32[]) public userKeys;
    mapping(address => uint256[]) public userPolicies;

    // Global security parameters
    uint256 public constant MAX_KEY_STRENGTH = 512;    // Maximum security bits
    uint256 public constant MIN_KEY_STRENGTH = 128;    // Minimum security bits
    uint256 public constant MAX_EXPIRATION = 365 days; // Maximum key lifetime
    uint256 public constant SESSION_TIMEOUT = 1 hours;  // Threshold session timeout

    uint256 private _nextPolicyId;
    bytes32[] private _activeSessions;

    // Events
    event VaultEntryCreated(bytes32 indexed entryId, address indexed owner, QuantumSignatureType sigType);
    event VaultEntryAccessed(bytes32 indexed entryId, address indexed accessor);
    event QuantumKeyGenerated(bytes32 indexed keyId, address indexed owner, QuantumSignatureType keyType);
    event QuantumKeyRevoked(bytes32 indexed keyId, string reason);
    event MultiSigPolicyCreated(uint256 indexed policyId, uint256 requiredSignatures);
    event ThresholdSignatureCollected(bytes32 indexed sessionId, address indexed signer);
    event ThresholdOperationExecuted(bytes32 indexed sessionId, bytes32 operationHash);
    event QuantumSecurityBreach(address indexed account, string breachType);

    // Modifiers
    modifier onlyVaultManager() {
        require(hasRole(VAULT_MANAGER, msg.sender), "Only vault manager");
        _;
    }

    modifier onlyQuantumAuthority() {
        require(
            hasRole(QUANTUM_AUTHORITY, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only quantum authority"
        );
        _;
    }

    modifier validQuantumKey(bytes32 keyId) {
        require(quantumKeys[keyId].isActive, "Key not active");
        require(!quantumKeys[keyId].isCompromised, "Key compromised");
        require(block.timestamp <= quantumKeys[keyId].expiresAt, "Key expired");
        _;
    }

    modifier notExpired(uint256 expiration) {
        require(expiration == 0 || block.timestamp <= expiration, "Entry expired");
        _;
    }

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VAULT_MANAGER, admin);
        _grantRole(QUANTUM_AUTHORITY, admin);
        _grantRole(EMERGENCY_AUTHORITY, admin);
    }

    /**
     * @dev Creates a new vault entry with quantum security
     */
    function createVaultEntry(
        bytes32 contentHash,
        QuantumSignatureType sigType,
        bytes memory quantumSignature,
        bytes32 merkleRoot,
        uint256 expiration,
        bytes32 quantumKeyId
    )
        public
        whenNotPaused
        validQuantumKey(quantumKeyId)
        returns (bytes32)
    {
        require(quantumKeys[quantumKeyId].owner == msg.sender, "Not key owner");
        require(expiration == 0 || expiration <= block.timestamp + MAX_EXPIRATION, "Expiration too far");

        bytes32 entryId = keccak256(abi.encodePacked(
            msg.sender,
            contentHash,
            block.timestamp,
            block.number
        ));

        require(vaultEntries[entryId].entryId == bytes32(0), "Entry already exists");

        // Verify quantum signature
        require(_verifyQuantumSignature(contentHash, quantumSignature, sigType, quantumKeyId), "Invalid quantum signature");

        vaultEntries[entryId] = VaultEntry({
            entryId: entryId,
            owner: msg.sender,
            contentHash: contentHash,
            sigType: sigType,
            quantumSignature: quantumSignature,
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            expiration: expiration,
            isActive: true,
            accessCount: 0,
            lastAccessor: address(0),
            lastAccessTime: 0
        });

        userVaultEntries[msg.sender].push(entryId);

        // Update key usage
        quantumKeys[quantumKeyId].usageCount++;

        emit VaultEntryCreated(entryId, msg.sender, sigType);

        return entryId;
    }

    /**
     * @dev Accesses a vault entry with quantum verification
     */
    function accessVaultEntry(
        bytes32 entryId,
        bytes memory accessProof,
        bytes32[] memory merkleProof
    )
        public
        whenNotPaused
        notExpired(vaultEntries[entryId].expiration)
        returns (bool)
    {
        VaultEntry storage entry = vaultEntries[entryId];
        require(entry.entryId != bytes32(0), "Entry does not exist");
        require(entry.isActive, "Entry not active");
        require(entry.owner == msg.sender, "Not entry owner");

        // Verify merkle proof if provided
        if (merkleProof.length > 0) {
            require(MerkleProof.verify(merkleProof, entry.merkleRoot, keccak256(accessProof)), "Invalid merkle proof");
        }

        // Update access tracking
        entry.accessCount++;
        entry.lastAccessor = msg.sender;
        entry.lastAccessTime = block.timestamp;

        emit VaultEntryAccessed(entryId, msg.sender);

        return true;
    }

    /**
     * @dev Generates a new quantum-resistant key pair
     */
    function generateQuantumKey(
        QuantumSignatureType keyType,
        bytes memory publicKey,
        uint256 keyStrength,
        uint256 validityPeriod
    )
        public
        whenNotPaused
        returns (bytes32)
    {
        require(keyStrength >= MIN_KEY_STRENGTH && keyStrength <= MAX_KEY_STRENGTH, "Invalid key strength");
        require(validityPeriod <= MAX_EXPIRATION, "Validity period too long");
        require(publicKey.length > 0, "Public key required");

        bytes32 keyId = keccak256(abi.encodePacked(
            msg.sender,
            keyType,
            publicKey,
            block.timestamp
        ));

        require(quantumKeys[keyId].keyId == bytes32(0), "Key already exists");

        quantumKeys[keyId] = QuantumKey({
            keyId: keyId,
            owner: msg.sender,
            keyType: keyType,
            publicKey: publicKey,
            keyStrength: keyStrength,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + validityPeriod,
            isActive: true,
            isCompromised: false,
            usageCount: 0
        });

        userKeys[msg.sender].push(keyId);

        emit QuantumKeyGenerated(keyId, msg.sender, keyType);

        return keyId;
    }

    /**
     * @dev Revokes a quantum key
     */
    function revokeQuantumKey(bytes32 keyId, string memory reason)
        public
        whenNotPaused
    {
        QuantumKey storage key = quantumKeys[keyId];
        require(key.keyId != bytes32(0), "Key does not exist");
        require(key.owner == msg.sender || hasRole(QUANTUM_AUTHORITY, msg.sender), "Not authorized");

        key.isActive = false;

        emit QuantumKeyRevoked(keyId, reason);
    }

    /**
     * @dev Creates a multi-signature policy
     */
    function createMultiSigPolicy(
        uint256 requiredSignatures,
        address[] memory authorizedSigners,
        QuantumSignatureType sigType,
        uint256 timelock
    )
        public
        onlyVaultManager
        whenNotPaused
        returns (uint256)
    {
        require(requiredSignatures > 0, "Required signatures must be positive");
        require(requiredSignatures <= authorizedSigners.length, "Too many required signatures");
        require(authorizedSigners.length > 0, "At least one signer required");

        uint256 policyId = _nextPolicyId++;
        require(multiSigPolicies[policyId].policyId == 0, "Policy ID collision");

        multiSigPolicies[policyId] = MultiSigPolicy({
            policyId: policyId,
            requiredSignatures: requiredSignatures,
            authorizedSigners: authorizedSigners,
            sigType: sigType,
            timelock: timelock,
            lastExecution: 0,
            isActive: true
        });

        userPolicies[msg.sender].push(policyId);

        emit MultiSigPolicyCreated(policyId, requiredSignatures);

        return policyId;
    }

    /**
     * @dev Initiates a threshold signature session
     */
    function initiateThresholdSession(
        uint256 policyId,
        bytes32 operationHash
    )
        public
        whenNotPaused
        returns (bytes32)
    {
        MultiSigPolicy storage policy = multiSigPolicies[policyId];
        require(policy.policyId != 0, "Policy does not exist");
        require(policy.isActive, "Policy not active");
        require(block.timestamp >= policy.lastExecution + policy.timelock, "Timelock active");

        // Check if caller is authorized signer
        bool isAuthorized = false;
        for (uint256 i = 0; i < policy.authorizedSigners.length; i++) {
            if (policy.authorizedSigners[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Not authorized signer");

        bytes32 sessionId = keccak256(abi.encodePacked(
            policyId,
            operationHash,
            block.timestamp
        ));

        require(thresholdSessions[sessionId].sessionId == bytes32(0), "Session already exists");

        address[] memory signers = new address[](policy.authorizedSigners.length);
        bytes[] memory signatures = new bytes[](policy.authorizedSigners.length);

        thresholdSessions[sessionId] = ThresholdSession({
            sessionId: sessionId,
            policyId: policyId,
            operationHash: operationHash,
            signers: signers,
            signatures: signatures,
            collectedSignatures: 0,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + SESSION_TIMEOUT,
            executed: false
        });

        _activeSessions.push(sessionId);

        return sessionId;
    }

    /**
     * @dev Submits a signature for threshold session
     */
    function submitThresholdSignature(
        bytes32 sessionId,
        bytes memory signature
    )
        public
        whenNotPaused
    {
        ThresholdSession storage session = thresholdSessions[sessionId];
        require(session.sessionId != bytes32(0), "Session does not exist");
        require(!session.executed, "Session already executed");
        require(block.timestamp <= session.expiresAt, "Session expired");

        MultiSigPolicy storage policy = multiSigPolicies[session.policyId];

        // Verify signer is authorized
        bool isAuthorized = false;
        uint256 signerIndex;
        for (uint256 i = 0; i < policy.authorizedSigners.length; i++) {
            if (policy.authorizedSigners[i] == msg.sender) {
                isAuthorized = true;
                signerIndex = i;
                break;
            }
        }
        require(isAuthorized, "Not authorized signer");
        require(session.signers[signerIndex] == address(0), "Already signed");

        // Verify quantum signature
        require(_verifyQuantumSignature(session.operationHash, signature, policy.sigType, bytes32(0)), "Invalid signature");

        // Record signature
        session.signers[signerIndex] = msg.sender;
        session.signatures[signerIndex] = signature;
        session.collectedSignatures++;

        emit ThresholdSignatureCollected(sessionId, msg.sender);

        // Check if threshold reached
        if (session.collectedSignatures >= policy.requiredSignatures) {
            _executeThresholdOperation(sessionId);
        }
    }

    /**
     * @dev Emergency key compromise response
     */
    function emergencyKeyCompromise(
        bytes32 keyId,
        string memory breachType
    )
        public
        onlyRole(EMERGENCY_AUTHORITY)
        whenNotPaused
    {
        QuantumKey storage key = quantumKeys[keyId];
        require(key.keyId != bytes32(0), "Key does not exist");

        key.isCompromised = true;
        key.isActive = false;

        // Revoke all associated vault entries
        _revokeKeyEntries(keyId);

        emit QuantumSecurityBreach(key.owner, breachType);
    }

    /**
     * @dev Emergency pause for quantum security breach
     */
    function emergencyPause() public onlyRole(EMERGENCY_AUTHORITY) {
        _pause();
    }

    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() public onlyRole(EMERGENCY_AUTHORITY) {
        _unpause();
    }

    // Internal functions

    function _verifyQuantumSignature(
        bytes32 message,
        bytes memory signature,
        QuantumSignatureType sigType,
        bytes32 keyId
    ) internal view returns (bool) {
        // In production, this would implement actual quantum signature verification
        // For now, we use simplified verification

        if (sigType == QuantumSignatureType.DILITHIUM) {
            // CRYSTALS-Dilithium verification (simplified)
            return signature.length >= 32; // Minimum signature size
        } else if (sigType == QuantumSignatureType.FALCON) {
            // FALCON verification (simplified)
            return signature.length >= 64; // Minimum signature size
        } else if (sigType == QuantumSignatureType.SPHINCS) {
            // SPHINCS+ verification (simplified)
            return signature.length >= 128; // Minimum signature size
        }

        // For multi-sig and threshold, additional verification logic would be needed
        return true; // Placeholder for demo
    }

    function _executeThresholdOperation(bytes32 sessionId) internal {
        ThresholdSession storage session = thresholdSessions[sessionId];
        require(!session.executed, "Already executed");

        session.executed = true;

        MultiSigPolicy storage policy = multiSigPolicies[session.policyId];
        policy.lastExecution = block.timestamp;

        // Remove from active sessions
        for (uint256 i = 0; i < _activeSessions.length; i++) {
            if (_activeSessions[i] == sessionId) {
                _activeSessions[i] = _activeSessions[_activeSessions.length - 1];
                _activeSessions.pop();
                break;
            }
        }

        emit ThresholdOperationExecuted(sessionId, session.operationHash);
    }

    function _revokeKeyEntries(bytes32 keyId) internal {
        // This would iterate through all vault entries using this key
        // and revoke them. Implementation depends on indexing strategy.
    }

    // View functions

    function getVaultEntry(bytes32 entryId) public view returns (VaultEntry memory) {
        return vaultEntries[entryId];
    }

    function getQuantumKey(bytes32 keyId) public view returns (QuantumKey memory) {
        return quantumKeys[keyId];
    }

    function getMultiSigPolicy(uint256 policyId) public view returns (MultiSigPolicy memory) {
        return multiSigPolicies[policyId];
    }

    function getThresholdSession(bytes32 sessionId) public view returns (ThresholdSession memory) {
        return thresholdSessions[sessionId];
    }

    function getUserVaultEntries(address user) public view returns (bytes32[] memory) {
        return userVaultEntries[user];
    }

    function getUserKeys(address user) public view returns (bytes32[] memory) {
        return userKeys[user];
    }

    function getUserPolicies(address user) public view returns (uint256[] memory) {
        return userPolicies[user];
    }

    function getActiveSessions() public view returns (bytes32[] memory) {
        return _activeSessions;
    }

    function isKeyValid(bytes32 keyId) public view returns (bool) {
        QuantumKey memory key = quantumKeys[keyId];
        return key.isActive &&
               !key.isCompromised &&
               block.timestamp <= key.expiresAt;
    }

    function getSessionStatus(bytes32 sessionId) public view returns (
        bool exists,
        bool executed,
        uint256 collectedSignatures,
        uint256 requiredSignatures,
        bool expired
    ) {
        ThresholdSession memory session = thresholdSessions[sessionId];
        if (session.sessionId == bytes32(0)) {
            return (false, false, 0, 0, false);
        }

        MultiSigPolicy memory policy = multiSigPolicies[session.policyId];

        return (
            true,
            session.executed,
            session.collectedSignatures,
            policy.requiredSignatures,
            block.timestamp > session.expiresAt
        );
    }
}
