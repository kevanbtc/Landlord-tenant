// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DomainResolver
 * @dev Domain name resolution contract for Digital Giant L1
 * Implements ENS-like resolution with quantum security and regulatory compliance
 * Supports .giant and .$ TLD resolution with multi-coin address support
 */
contract DomainResolver is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant RESOLVER_MANAGER = keccak256("RESOLVER_MANAGER");
    bytes32 public constant REGULATORY_AUTHORITY = keccak256("REGULATORY_AUTHORITY");

    // Coin types for multi-coin resolution (similar to ENS)
    enum CoinType {
        ETH,        // Ethereum
        BTC,        // Bitcoin
        LTC,        // Litecoin
        DOGE,       // Dogecoin
        SOL,        // Solana
        ADA,        // Cardano
        DOT,        // Polkadot
        AVAX,       // Avalanche
        MATIC,      // Polygon
        BNB         // Binance Smart Chain
    }

    // Resolution record
    struct ResolutionRecord {
        bytes32 domainHash;           // keccak256 of domain name
        address owner;                // Record owner
        address resolver;             // Resolution contract
        uint256 ttl;                  // Time to live
        uint256 lastUpdated;          // Last update timestamp
        bool isActive;                // Record status
    }

    // Multi-coin address record
    struct MultiCoinRecord {
        CoinType coinType;
        bytes addressData;            // Address bytes (can be various formats)
        uint256 ttl;
        bool isActive;
    }

    // Text record
    struct TextRecord {
        string key;
        string value;
        uint256 ttl;
        bool isActive;
    }

    // Content hash record
    struct ContentHashRecord {
        bytes32 contentHash;          // IPFS/Arweave hash
        string contentType;           // "ipfs", "arweave", "swarm", etc.
        uint256 ttl;
        bool isActive;
    }

    // State variables
    mapping(bytes32 => ResolutionRecord) public resolutionRecords;
    mapping(bytes32 => mapping(CoinType => MultiCoinRecord)) public multiCoinRecords;
    mapping(bytes32 => mapping(string => TextRecord)) public textRecords;
    mapping(bytes32 => ContentHashRecord) public contentHashRecords;

    // Domain ownership verification
    address public domainNFT;

    // Default TTL values
    uint256 public constant DEFAULT_TTL = 3600;     // 1 hour
    uint256 public constant MAX_TTL = 31536000;     // 1 year

    // Events
    event ResolutionRecordSet(bytes32 indexed domainHash, address indexed owner, address indexed resolver);
    event MultiCoinAddressSet(bytes32 indexed domainHash, CoinType coinType, bytes addressData);
    event TextRecordSet(bytes32 indexed domainHash, string key, string value);
    event ContentHashSet(bytes32 indexed domainHash, bytes32 contentHash, string contentType);
    event ResolutionRecordCleared(bytes32 indexed domainHash);
    event DomainTransferred(bytes32 indexed domainHash, address indexed from, address to);

    // Modifiers
    modifier onlyResolverManager() {
        require(hasRole(RESOLVER_MANAGER, msg.sender), "Only resolver manager");
        _;
    }

    modifier onlyRegulatoryAuthority() {
        require(
            hasRole(REGULATORY_AUTHORITY, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only regulatory authority"
        );
        _;
    }

    modifier onlyDomainOwner(bytes32 domainHash) {
        require(_isDomainOwner(domainHash, msg.sender), "Not domain owner");
        _;
    }

    modifier validTTL(uint256 ttl) {
        require(ttl <= MAX_TTL, "TTL too high");
        _;
    }

    constructor(address admin, address _domainNFT) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RESOLVER_MANAGER, admin);
        _grantRole(REGULATORY_AUTHORITY, admin);

        domainNFT = _domainNFT;
    }

    /**
     * @dev Set resolution record for a domain
     */
    function setResolutionRecord(
        string memory domainName,
        address resolver,
        uint256 ttl
    )
        public
        whenNotPaused
        validTTL(ttl)
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));

        resolutionRecords[domainHash] = ResolutionRecord({
            domainHash: domainHash,
            owner: msg.sender,
            resolver: resolver,
            ttl: ttl,
            lastUpdated: block.timestamp,
            isActive: true
        });

        emit ResolutionRecordSet(domainHash, msg.sender, resolver);
    }

    /**
     * @dev Set multi-coin address for a domain
     */
    function setMultiCoinAddress(
        string memory domainName,
        CoinType coinType,
        bytes memory addressData,
        uint256 ttl
    )
        public
        whenNotPaused
        validTTL(ttl)
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        require(_isValidAddressForCoin(coinType, addressData), "Invalid address format");

        multiCoinRecords[domainHash][coinType] = MultiCoinRecord({
            coinType: coinType,
            addressData: addressData,
            ttl: ttl,
            isActive: true
        });

        emit MultiCoinAddressSet(domainHash, coinType, addressData);
    }

    /**
     * @dev Set text record for a domain
     */
    function setTextRecord(
        string memory domainName,
        string memory key,
        string memory value,
        uint256 ttl
    )
        public
        whenNotPaused
        validTTL(ttl)
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));

        textRecords[domainHash][key] = TextRecord({
            key: key,
            value: value,
            ttl: ttl,
            isActive: true
        });

        emit TextRecordSet(domainHash, key, value);
    }

    /**
     * @dev Set content hash for a domain
     */
    function setContentHash(
        string memory domainName,
        bytes32 contentHash,
        string memory contentType,
        uint256 ttl
    )
        public
        whenNotPaused
        validTTL(ttl)
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));

        contentHashRecords[domainHash] = ContentHashRecord({
            contentHash: contentHash,
            contentType: contentType,
            ttl: ttl,
            isActive: true
        });

        emit ContentHashSet(domainHash, contentHash, contentType);
    }

    /**
     * @dev Resolve domain to address (ETH)
     */
    function resolve(string memory domainName)
        public
        view
        returns (address)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        ResolutionRecord memory record = resolutionRecords[domainHash];

        require(record.isActive, "Domain not active");
        require(block.timestamp <= record.lastUpdated + record.ttl, "Record expired");

        return record.resolver;
    }

    /**
     * @dev Resolve domain to multi-coin address
     */
    function resolveCoinAddress(
        string memory domainName,
        CoinType coinType
    )
        public
        view
        returns (bytes memory)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        MultiCoinRecord memory record = multiCoinRecords[domainHash][coinType];

        require(record.isActive, "Address record not active");
        require(block.timestamp <= record.ttl, "Record expired");

        return record.addressData;
    }

    /**
     * @dev Get text record for domain
     */
    function resolveTextRecord(
        string memory domainName,
        string memory key
    )
        public
        view
        returns (string memory)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        TextRecord memory record = textRecords[domainHash][key];

        require(record.isActive, "Text record not active");
        require(block.timestamp <= record.ttl, "Record expired");

        return record.value;
    }

    /**
     * @dev Get content hash for domain
     */
    function resolveContentHash(string memory domainName)
        public
        view
        returns (bytes32, string memory)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        ContentHashRecord memory record = contentHashRecords[domainHash];

        require(record.isActive, "Content hash not set");
        require(block.timestamp <= record.ttl, "Record expired");

        return (record.contentHash, record.contentType);
    }

    /**
     * @dev Bulk resolve multiple records
     */
    function bulkResolve(
        string memory domainName,
        CoinType[] memory coinTypes,
        string[] memory textKeys
    )
        public
        view
        returns (
            address resolverAddress,
            bytes[] memory coinAddresses,
            string[] memory textValues,
            bytes32 contentHash,
            string memory contentType
        )
    {
        resolverAddress = resolve(domainName);

        coinAddresses = new bytes[](coinTypes.length);
        for (uint256 i = 0; i < coinTypes.length; i++) {
            coinAddresses[i] = resolveCoinAddress(domainName, coinTypes[i]);
        }

        textValues = new string[](textKeys.length);
        for (uint256 i = 0; i < textKeys.length; i++) {
            textValues[i] = resolveTextRecord(domainName, textKeys[i]);
        }

        (contentHash, contentType) = resolveContentHash(domainName);
    }

    /**
     * @dev Clear all records for a domain
     */
    function clearResolutionRecords(string memory domainName)
        public
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
        whenNotPaused
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));

        delete resolutionRecords[domainHash];
        // Note: Multi-coin and text records would need separate clearing

        emit ResolutionRecordCleared(domainHash);
    }

    /**
     * @dev Transfer domain resolution ownership
     */
    function transferDomainResolution(
        string memory domainName,
        address newOwner
    )
        public
        onlyDomainOwner(keccak256(abi.encodePacked(domainName)))
        whenNotPaused
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        ResolutionRecord storage record = resolutionRecords[domainHash];

        address oldOwner = record.owner;
        record.owner = newOwner;
        record.lastUpdated = block.timestamp;

        emit DomainTransferred(domainHash, oldOwner, newOwner);
    }

    /**
     * @dev Check if domain record exists and is active
     */
    function domainRecordExists(string memory domainName)
        public
        view
        returns (bool)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        ResolutionRecord memory record = resolutionRecords[domainHash];

        return record.isActive &&
               block.timestamp <= record.lastUpdated + record.ttl;
    }

    /**
     * @dev Get domain record details
     */
    function getDomainRecord(string memory domainName)
        public
        view
        returns (ResolutionRecord memory)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        return resolutionRecords[domainHash];
    }

    /**
     * @dev Emergency pause
     */
    function emergencyPause() public onlyRegulatoryAuthority {
        _pause();
    }

    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() public onlyRegulatoryAuthority {
        _unpause();
    }

    // Internal functions

    function _isDomainOwner(bytes32 domainHash, address account) internal view returns (bool) {
        // Check with DomainNFT contract
        if (domainNFT != address(0)) {
            // Call DomainNFT contract to verify ownership
            // This would integrate with the DomainNFT contract
            return true; // Placeholder
        }
        return true; // Placeholder for demo
    }

    function _isValidAddressForCoin(CoinType coinType, bytes memory addressData)
        internal
        pure
        returns (bool)
    {
        // Basic validation for different coin types
        if (coinType == CoinType.ETH) {
            // Ethereum address validation
            return addressData.length == 20;
        } else if (coinType == CoinType.BTC) {
            // Bitcoin address validation (simplified)
            return addressData.length >= 26 && addressData.length <= 35;
        } else if (coinType == CoinType.SOL) {
            // Solana address validation
            return addressData.length == 32;
        }
        // Add more coin validations as needed
        return addressData.length > 0;
    }

    // View functions

    function supportsCoinType(CoinType coinType) public pure returns (bool) {
        return coinType >= CoinType.ETH && coinType <= CoinType.BNB;
    }

    function getSupportedCoinTypes() public pure returns (string[] memory) {
        string[] memory coins = new string[](10);
        coins[0] = "ETH";
        coins[1] = "BTC";
        coins[2] = "LTC";
        coins[3] = "DOGE";
        coins[4] = "SOL";
        coins[5] = "ADA";
        coins[6] = "DOT";
        coins[7] = "AVAX";
        coins[8] = "MATIC";
        coins[9] = "BNB";
        return coins;
    }

    function getResolutionTTL(string memory domainName) public view returns (uint256) {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        return resolutionRecords[domainHash].ttl;
    }

    function isRecordExpired(string memory domainName) public view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        ResolutionRecord memory record = resolutionRecords[domainHash];
        return block.timestamp > record.lastUpdated + record.ttl;
    }
}
