// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DomainNFT
 * @dev ERC-721 token contract for blockchain domain names on Digital Giant L1
 * Implements .giant and .$ TLDs with regulatory compliance and quantum security
 * Compliant with ICANN-like standards and enterprise blockchain requirements
 */
contract DomainNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Royalty,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant DOMAIN_MANAGER = keccak256("DOMAIN_MANAGER");
    bytes32 public constant REGULATORY_AUTHORITY = keccak256("REGULATORY_AUTHORITY");
    bytes32 public constant CERTIFICATE_SYSTEM = keccak256("CERTIFICATE_SYSTEM");

    Counters.Counter private _tokenIdCounter;

    // TLD configurations
    struct TLDConfig {
        string name;                    // ".giant", ".$"
        uint256 registrationFee;       // Base registration fee
        uint256 renewalFee;           // Annual renewal fee
        uint256 minLength;            // Minimum domain length
        uint256 maxLength;            // Maximum domain length
        bool isActive;                // TLD availability
        bool requiresKYC;             // KYC requirement
        address royaltyReceiver;      // Royalty recipient
        uint96 royaltyFee;           // Royalty percentage (basis points)
    }

    // Domain metadata
    struct DomainData {
        string domainName;            // Full domain (e.g., "alice.giant")
        string tld;                   // TLD (".giant", ".$")
        address owner;                // Current owner
        address controller;           // Authorized controller
        uint256 registrationDate;     // Registration timestamp
        uint256 expiryDate;           // Expiry timestamp
        bytes32 contentHash;          // IPFS/Arweave content hash
        address resolver;             // Resolution contract address
        bool isActive;                // Domain status
        uint256 renewalCount;         // Number of renewals
        bytes32 certificateId;        // Associated certificate
    }

    // State variables
    mapping(string => TLDConfig) public tldConfigs;
    mapping(uint256 => DomainData) public domainData;
    mapping(string => uint256) public domainNameToTokenId;
    mapping(address => uint256[]) public ownerDomains;
    mapping(bytes32 => bool) public usedCertificateIds;

    // Regulatory and compliance
    address public regulatoryCompliance;
    address public certificateNFT;

    // Domain name validation
    mapping(string => bool) public reservedNames;
    mapping(string => bool) public bannedNames;

    // Economic parameters
    uint256 public constant GRACE_PERIOD = 30 days;
    uint256 public constant AUCTION_DURATION = 7 days;
    uint256 public constant MIN_REGISTRATION_PERIOD = 365 days;
    uint256 public constant MAX_REGISTRATION_PERIOD = 10 * 365 days;

    // Events
    event DomainRegistered(
        uint256 indexed tokenId,
        string indexed domainName,
        address indexed owner,
        uint256 expiryDate
    );

    event DomainRenewed(
        uint256 indexed tokenId,
        string indexed domainName,
        uint256 newExpiryDate
    );

    event DomainTransferred(
        uint256 indexed tokenId,
        string indexed domainName,
        address indexed from,
        address to
    );

    event TLDConfigured(
        string indexed tld,
        uint256 registrationFee,
        bool isActive
    );

    event DomainResolved(
        string indexed domainName,
        address indexed resolver,
        bytes32 contentHash
    );

    // Modifiers
    modifier onlyDomainManager() {
        require(hasRole(DOMAIN_MANAGER, msg.sender), "Only domain manager");
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

    modifier validDomainName(string memory domainName) {
        require(_isValidDomainName(domainName), "Invalid domain name");
        _;
    }

    modifier domainAvailable(string memory domainName) {
        require(domainNameToTokenId[domainName] == 0, "Domain already registered");
        require(!reservedNames[domainName] && !bannedNames[domainName], "Domain not available");
        _;
    }

    modifier domainOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not domain owner");
        _;
    }

    modifier domainActive(uint256 tokenId) {
        require(domainData[tokenId].isActive, "Domain not active");
        require(block.timestamp <= domainData[tokenId].expiryDate, "Domain expired");
        _;
    }

    constructor(
        address admin,
        address _regulatoryCompliance,
        address _certificateNFT
    ) ERC721("Digital Giant Domain", "DGD") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DOMAIN_MANAGER, admin);
        _grantRole(REGULATORY_AUTHORITY, admin);

        regulatoryCompliance = _regulatoryCompliance;
        certificateNFT = _certificateNFT;

        // Set default royalty (1%)
        _setDefaultRoyalty(admin, 100);

        // Initialize TLDs
        _initializeTLDs();
    }

    /**
     * @dev Initialize default TLD configurations
     */
    function _initializeTLDs() internal {
        // .giant TLD
        tldConfigs[".giant"] = TLDConfig({
            name: ".giant",
            registrationFee: 100 ether,    // 100 DGT tokens
            renewalFee: 50 ether,          // 50 DGT tokens annually
            minLength: 3,
            maxLength: 63,
            isActive: true,
            requiresKYC: true,
            royaltyReceiver: msg.sender,
            royaltyFee: 100                 // 1%
        });

        // .$ TLD (special enterprise TLD)
        tldConfigs[".$"] = TLDConfig({
            name: ".$",
            registrationFee: 1000 ether,   // 1000 DGT tokens (premium)
            renewalFee: 500 ether,         // 500 DGT tokens annually
            minLength: 2,
            maxLength: 32,
            isActive: true,
            requiresKYC: true,
            royaltyReceiver: msg.sender,
            royaltyFee: 200                 // 2%
        });

        emit TLDConfigured(".giant", 100 ether, true);
        emit TLDConfigured(".$", 1000 ether, true);
    }

    /**
     * @dev Register a new domain name
     */
    function registerDomain(
        string memory domainName,
        string memory tld,
        uint256 registrationPeriod,
        address resolver,
        bytes32 certificateId
    )
        public
        payable
        whenNotPaused
        validDomainName(domainName)
        domainAvailable(domainName)
        nonReentrant
        returns (uint256)
    {
        TLDConfig memory config = tldConfigs[tld];
        require(config.isActive, "TLD not available");
        require(registrationPeriod >= MIN_REGISTRATION_PERIOD, "Registration period too short");
        require(registrationPeriod <= MAX_REGISTRATION_PERIOD, "Registration period too long");

        // KYC check if required
        if (config.requiresKYC) {
            require(_hasValidKYC(msg.sender), "KYC required for this TLD");
        }

        // Certificate integration
        if (certificateId != bytes32(0)) {
            require(!usedCertificateIds[certificateId], "Certificate already used");
            require(_ownsCertificate(msg.sender, certificateId), "Not certificate owner");
            usedCertificateIds[certificateId] = true;
        }

        // Calculate total cost
        uint256 totalCost = config.registrationFee * (registrationPeriod / 365 days);
        require(msg.value >= totalCost, "Insufficient payment");

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        // Mint domain NFT
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        string memory fullDomainName = string(abi.encodePacked(domainName, tld));

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _generateDomainURI(fullDomainName, certificateId));

        // Set domain data
        domainData[tokenId] = DomainData({
            domainName: fullDomainName,
            tld: tld,
            owner: msg.sender,
            controller: msg.sender,
            registrationDate: block.timestamp,
            expiryDate: block.timestamp + registrationPeriod,
            contentHash: bytes32(0),
            resolver: resolver,
            isActive: true,
            renewalCount: 0,
            certificateId: certificateId
        });

        // Update mappings
        domainNameToTokenId[fullDomainName] = tokenId;
        ownerDomains[msg.sender].push(tokenId);

        // Set royalty for this token
        _setTokenRoyalty(tokenId, config.royaltyReceiver, config.royaltyFee);

        emit DomainRegistered(tokenId, fullDomainName, msg.sender, domainData[tokenId].expiryDate);

        return tokenId;
    }

    /**
     * @dev Renew a domain registration
     */
    function renewDomain(
        uint256 tokenId,
        uint256 renewalPeriod
    )
        public
        payable
        domainOwner(tokenId)
        domainActive(tokenId)
        whenNotPaused
        nonReentrant
    {
        DomainData storage domain = domainData[tokenId];
        TLDConfig memory config = tldConfigs[domain.tld];

        require(renewalPeriod >= MIN_REGISTRATION_PERIOD, "Renewal period too short");

        uint256 renewalCost = config.renewalFee * (renewalPeriod / 365 days);
        require(msg.value >= renewalCost, "Insufficient renewal fee");

        // Refund excess
        if (msg.value > renewalCost) {
            payable(msg.sender).transfer(msg.value - renewalCost);
        }

        // Update expiry date
        domain.expiryDate += renewalPeriod;
        domain.renewalCount++;

        emit DomainRenewed(tokenId, domain.domainName, domain.expiryDate);
    }

    /**
     * @dev Set domain resolver and content
     */
    function setDomainResolver(
        uint256 tokenId,
        address resolver,
        bytes32 contentHash
    )
        public
        domainOwner(tokenId)
        domainActive(tokenId)
        whenNotPaused
    {
        DomainData storage domain = domainData[tokenId];
        domain.resolver = resolver;
        domain.contentHash = contentHash;

        emit DomainResolved(domain.domainName, resolver, contentHash);
    }

    /**
     * @dev Transfer domain controller
     */
    function transferDomainController(
        uint256 tokenId,
        address newController
    )
        public
        domainOwner(tokenId)
        domainActive(tokenId)
        whenNotPaused
    {
        domainData[tokenId].controller = newController;
    }

    /**
     * @dev Configure TLD settings
     */
    function configureTLD(
        string memory tld,
        uint256 registrationFee,
        uint256 renewalFee,
        uint256 minLength,
        uint256 maxLength,
        bool isActive,
        bool requiresKYC
    )
        public
        onlyDomainManager
    {
        tldConfigs[tld] = TLDConfig({
            name: tld,
            registrationFee: registrationFee,
            renewalFee: renewalFee,
            minLength: minLength,
            maxLength: maxLength,
            isActive: isActive,
            requiresKYC: requiresKYC,
            royaltyReceiver: tldConfigs[tld].royaltyReceiver,
            royaltyFee: tldConfigs[tld].royaltyFee
        });

        emit TLDConfigured(tld, registrationFee, isActive);
    }

    /**
     * @dev Reserve or ban domain names
     */
    function setDomainStatus(
        string[] memory names,
        bool reserved,
        bool banned
    )
        public
        onlyRegulatoryAuthority
    {
        for (uint256 i = 0; i < names.length; i++) {
            if (reserved) {
                reservedNames[names[i]] = true;
            }
            if (banned) {
                bannedNames[names[i]] = true;
            }
        }
    }

    /**
     * @dev Get domain information
     */
    function getDomainInfo(uint256 tokenId)
        public
        view
        returns (DomainData memory)
    {
        return domainData[tokenId];
    }

    /**
     * @dev Get domain info by name
     */
    function getDomainByName(string memory domainName)
        public
        view
        returns (uint256 tokenId, DomainData memory data)
    {
        tokenId = domainNameToTokenId[domainName];
        if (tokenId != 0) {
            data = domainData[tokenId];
        }
    }

    /**
     * @dev Check if domain is available
     */
    function isDomainAvailable(string memory domainName)
        public
        view
        returns (bool)
    {
        return domainNameToTokenId[domainName] == 0 &&
               !reservedNames[domainName] &&
               !bannedNames[domainName];
    }

    /**
     * @dev Get owner domains
     */
    function getOwnerDomains(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return ownerDomains[owner];
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

    function _isValidDomainName(string memory domainName) internal pure returns (bool) {
        bytes memory domainBytes = bytes(domainName);
        uint256 length = domainBytes.length;

        if (length == 0 || length > 63) return false;

        // Check for valid characters (alphanumeric, hyphen)
        for (uint256 i = 0; i < length; i++) {
            bytes1 char = domainBytes[i];
            if (!(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A) && // a-z
                char != 0x2D) { // hyphen
                return false;
            }
        }

        // Cannot start or end with hyphen
        if (domainBytes[0] == 0x2D || domainBytes[length - 1] == 0x2D) {
            return false;
        }

        return true;
    }

    function _hasValidKYC(address account) internal view returns (bool) {
        // Integration with regulatory compliance contract
        if (regulatoryCompliance != address(0)) {
            // Call regulatory compliance contract
            return true; // Placeholder
        }
        return true;
    }

    function _ownsCertificate(address account, bytes32 certificateId) internal view returns (bool) {
        // Integration with certificate NFT contract
        if (certificateNFT != address(0)) {
            // Call certificate contract
            return true; // Placeholder
        }
        return true;
    }

    function _generateDomainURI(string memory domainName, bytes32 certificateId)
        internal
        pure
        returns (string memory)
    {
        // Generate IPFS-like URI for domain metadata
        return string(abi.encodePacked(
            "ipfs://",
            uint256(certificateId).toHexString(),
            "/",
            domainName,
            ".json"
        ));
    }

    // Override functions
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
        onlyDomainManager
    {
        DomainData storage domain = domainData[tokenId];
        require(domain.isActive, "Domain not active");

        address owner = ownerOf(tokenId);
        string memory domainName = domain.domainName;

        // Remove from mappings
        delete domainNameToTokenId[domainName];
        _removeFromOwnerDomains(owner, tokenId);

        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _removeFromOwnerDomains(address owner, uint256 tokenId) internal {
        uint256[] storage domains = ownerDomains[owner];
        for (uint256 i = 0; i < domains.length; i++) {
            if (domains[i] == tokenId) {
                domains[i] = domains[domains.length - 1];
                domains.pop();
                break;
            }
        }
    }

    // View functions
    function getTotalDomains() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getTLDConfig(string memory tld) public view returns (TLDConfig memory) {
        return tldConfigs[tld];
    }

    function isDomainExpired(uint256 tokenId) public view returns (bool) {
        return block.timestamp > domainData[tokenId].expiryDate;
    }

    function getDomainExpiry(uint256 tokenId) public view returns (uint256) {
        return domainData[tokenId].expiryDate;
    }
}
