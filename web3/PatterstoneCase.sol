// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PatterstoneCase - On-chain evidence registry for 3530 Patterstone Dr dispute
/// @notice Stores immutable metadata and evidence references (IPFS hashes) for this specific case.
contract PatterstoneCase {
    struct Evidence {
        uint256 id;
        string externalId;   // e.g. "EXH-A-01" (matches evidence_manifest.json)
        string category;     // e.g. "photo", "message", "report", "timeline"
        string description;  // short human-readable description
        string ipfsHash;     // IPFS CID
        uint256 createdAt;   // block timestamp when registered
        address submittedBy; // msg.sender
    }

    string public caseId;
    string public propertyAddress;
    string public jurisdiction;
    string public plaintiff;
    string public defendant;
    uint256 public openedAt;
    bool public isClosed;

    address public owner;
    uint256 private _evidenceCount;

    mapping(uint256 => Evidence) private _evidenceById;

    event EvidenceRegistered(
        uint256 indexed id,
        string externalId,
        string category,
        string ipfsHash,
        uint256 createdAt,
        address indexed submittedBy
    );

    event CaseClosed(uint256 timestamp, address indexed closedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(
        string memory _caseId,
        string memory _propertyAddress,
        string memory _jurisdiction,
        string memory _plaintiff,
        string memory _defendant
    ) {
        owner = msg.sender;
        caseId = _caseId;
        propertyAddress = _propertyAddress;
        jurisdiction = _jurisdiction;
        plaintiff = _plaintiff;
        defendant = _defendant;
        openedAt = block.timestamp;
        isClosed = false;
    }

    function registerEvidence(
        string memory externalId,
        string memory category,
        string memory description,
        string memory ipfsHash
    ) external onlyOwner returns (uint256) {
        require(bytes(externalId).length > 0, "externalId required");
        require(bytes(ipfsHash).length > 0, "ipfsHash required");

        _evidenceCount += 1;
        uint256 newId = _evidenceCount;

        Evidence memory ev = Evidence({
            id: newId,
            externalId: externalId,
            category: category,
            description: description,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            submittedBy: msg.sender
        });

        _evidenceById[newId] = ev;

        emit EvidenceRegistered(
            newId,
            externalId,
            category,
            ipfsHash,
            block.timestamp,
            msg.sender
        );

        return newId;
    }

    function getEvidence(uint256 id) external view returns (
        uint256,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ) {
        Evidence memory ev = _evidenceById[id];
        require(ev.id != 0, "Evidence not found");
        return (
            ev.id,
            ev.externalId,
            ev.category,
            ev.description,
            ev.ipfsHash,
            ev.createdAt,
            ev.submittedBy
        );
    }

    function evidenceCount() external view returns (uint256) {
        return _evidenceCount;
    }

    function closeCase() external onlyOwner {
        require(!isClosed, "Already closed");
        isClosed = true;
        emit CaseClosed(block.timestamp, msg.sender);
    }

    /// @notice Change owner if needed (e.g. assign to attorney wallet)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
 * @notice All evidence hashes, timestamps, and case facts permanently recorded
 * @notice This contract creates an permanent, tamper-proof case file that can never be altered
 * 
 * CASE: Yoda Burns v. Monisha [Last Name Unknown]
 * PROPERTY: 3530 Patterstone Drive, Alpharetta, GA 30022
 * ISSUE: Landlord's failure to repair 5-month plumbing/mold emergency, bad faith, constructive eviction
 * DAMAGES: $50,500 - $77,200 documented
 * 
 * This contract serves as immutable proof of:
 * - Timeline of events (May 2025 - September 2025)
 * - Evidence documentation (photos, messages, lease, payments)
 * - Tenant's perfect payment history ($36,000 paid on time)
 * - Landlord's bad faith (6+ documented events)
 * - Damages calculation (rent abatement + repairs + loss of use)
 */
contract PattertstoneCaseRegistry {
    
    // ============ STRUCTS ============
    
    struct Evidence {
        string evidenceType;        // "photo", "text", "document", "video", "audio"
        string description;         // Brief description of evidence
        string ipfsHash;            // IPFS content identifier (CID)
        bytes32 sha256Hash;         // SHA-256 hash of original file
        uint256 timestamp;          // Block timestamp when submitted
        uint256 blockNumber;        // Block number
        address submitter;          // Address that submitted evidence
        string category;            // "damage", "communication", "financial", "medical", etc.
        bool verified;              // Verification status
        string metadata;            // Additional JSON metadata
    }
    
    struct TimelineEvent {
        string date;                // Event date (YYYY-MM-DD format)
        string description;         // Event description
        uint256 evidenceCount;      // Number of linked evidence items
        bytes32[] evidenceHashes;   // Array of linked evidence SHA-256 hashes
        uint256 timestamp;          // Block timestamp when added
        bool critical;              // Flag for critical events
        bool badFaithEvent;         // Flag for bad faith acts by landlord
        string eventType;           // "lease", "notice", "damage", "repair", "communication", etc.
    }
    
    struct RentPayment {
        string month;               // Payment month (YYYY-MM format)
        uint256 amount;             // Amount paid (in USD cents to avoid decimals)
        string datePaid;            // Date paid (YYYY-MM-DD)
        string paymentMethod;       // "check", "venmo", "zelle", etc.
        bool onTime;                // Was payment on time?
        string propertyCondition;   // Condition of property at time of payment
        bool badFaithAcceptance;    // Did landlord accept knowing property uninhabitable?
        bytes32 receiptHash;        // SHA-256 of payment receipt
        string ipfsReceipt;         // IPFS CID of receipt
        uint256 timestamp;          // Block timestamp when recorded
    }
    
    struct DamageItem {
        string category;            // "rent_abatement", "repair", "medical", "relocation", etc.
        string description;         // Description of damage
        uint256 amount;             // Amount in USD cents
        string calculation;         // Formula or explanation
        bytes32[] supportingEvidence; // Linked evidence hashes
        bool verified;              // Verification status
        string notes;               // Additional notes
        uint256 timestamp;          // Block timestamp when added
    }
    
    // ============ STATE VARIABLES ============
    
    // Case metadata
    string public constant CASE_ID = "YodaBurns-v-Monisha-2025";
    string public constant PROPERTY_ADDRESS = "3530 Patterstone Dr, Alpharetta, GA 30022";
    uint256 public constant MONTHLY_RENT = 300000; // $3,000.00 in cents
    string public constant LEASE_START = "2024-11-20";
    string public constant LEASE_END = "2025-11-20";
    
    // Parties
    address public immutable plaintiff;
    string public plaintiffName = "Yoda Burns";
    string public defendantName = "Monisha [Last Name]";
    
    // Storage arrays
    Evidence[] public evidenceChain;
    TimelineEvent[] public timeline;
    RentPayment[] public rentPayments;
    DamageItem[] public damages;
    
    // Mappings for quick lookup
    mapping(bytes32 => uint256) public hashToEvidenceId;
    mapping(string => uint256) public dateToEventId;
    mapping(string => uint256) public monthToPaymentId;
    mapping(bytes32 => bool) public evidenceExists;
    
    // Counters and statistics
    uint256 public totalRentPaid;
    uint256 public totalMonthsPaid;
    uint256 public monthsOnTime;
    uint256 public totalDamages;
    uint256 public badFaithEventCount;
    uint256 public criticalEventCount;
    
    // Status flags
    bool public caseActive = true;
    bool public settlementReached = false;
    uint256 public settlementAmount;
    string public caseStatus = "Active - Pre-Litigation";
    
    // ============ EVENTS ============
    
    event EvidenceSubmitted(
        uint256 indexed evidenceId,
        string evidenceType,
        bytes32 sha256Hash,
        string ipfsHash,
        uint256 timestamp
    );
    
    event TimelineEventAdded(
        uint256 indexed eventId,
        string date,
        string description,
        bool critical,
        bool badFaithEvent,
        uint256 timestamp
    );
    
    event RentPaymentRecorded(
        uint256 indexed paymentId,
        string month,
        uint256 amount,
        bool onTime,
        bool badFaithAcceptance,
        uint256 timestamp
    );
    
    event DamageItemAdded(
        uint256 indexed damageId,
        string category,
        uint256 amount,
        uint256 timestamp
    );
    
    event CaseStatusUpdated(
        string newStatus,
        uint256 timestamp
    );
    
    event SettlementReached(
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyPlaintiff() {
        require(msg.sender == plaintiff, "Only plaintiff can execute this");
        _;
    }
    
    modifier caseIsActive() {
        require(caseActive, "Case is closed");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        plaintiff = msg.sender;
    }
    
    // ============ EVIDENCE FUNCTIONS ============
    
    /**
     * @notice Submit new evidence to blockchain
     * @param _type Type of evidence
     * @param _description Brief description
     * @param _ipfsHash IPFS content identifier
     * @param _sha256Hash SHA-256 hash of original file
     * @param _category Evidence category
     * @param _metadata Additional JSON metadata
     * @return evidenceId The ID of the submitted evidence
     */
    function submitEvidence(
        string memory _type,
        string memory _description,
        string memory _ipfsHash,
        bytes32 _sha256Hash,
        string memory _category,
        string memory _metadata
    ) public onlyPlaintiff caseIsActive returns (uint256) {
        require(!evidenceExists[_sha256Hash], "Evidence already submitted");
        
        uint256 evidenceId = evidenceChain.length;
        
        evidenceChain.push(Evidence({
            evidenceType: _type,
            description: _description,
            ipfsHash: _ipfsHash,
            sha256Hash: _sha256Hash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            submitter: msg.sender,
            category: _category,
            verified: true,
            metadata: _metadata
        }));
        
        hashToEvidenceId[_sha256Hash] = evidenceId;
        evidenceExists[_sha256Hash] = true;
        
        emit EvidenceSubmitted(evidenceId, _type, _sha256Hash, _ipfsHash, block.timestamp);
        
        return evidenceId;
    }
    
    /**
     * @notice Submit multiple evidence items at once (gas efficient)
     */
    function submitEvidenceBatch(
        string[] memory _types,
        string[] memory _descriptions,
        string[] memory _ipfsHashes,
        bytes32[] memory _sha256Hashes,
        string[] memory _categories,
        string[] memory _metadata
    ) public onlyPlaintiff caseIsActive returns (uint256[] memory) {
        require(_types.length == _descriptions.length, "Array length mismatch");
        require(_types.length == _ipfsHashes.length, "Array length mismatch");
        require(_types.length == _sha256Hashes.length, "Array length mismatch");
        
        uint256[] memory ids = new uint256[](_types.length);
        
        for (uint256 i = 0; i < _types.length; i++) {
            ids[i] = submitEvidence(
                _types[i],
                _descriptions[i],
                _ipfsHashes[i],
                _sha256Hashes[i],
                _categories[i],
                _metadata[i]
            );
        }
        
        return ids;
    }
    
    /**
     * @notice Verify if evidence exists and get details
     */
    function verifyEvidence(bytes32 _hash) public view returns (
        bool exists,
        uint256 evidenceId,
        uint256 timestamp,
        string memory ipfsHash,
        string memory description
    ) {
        if (!evidenceExists[_hash]) {
            return (false, 0, 0, "", "");
        }
        
        evidenceId = hashToEvidenceId[_hash];
        Evidence memory ev = evidenceChain[evidenceId];
        
        return (true, evidenceId, ev.timestamp, ev.ipfsHash, ev.description);
    }
    
    // ============ TIMELINE FUNCTIONS ============
    
    /**
     * @notice Add timeline event with linked evidence
     */
    function addTimelineEvent(
        string memory _date,
        string memory _description,
        bytes32[] memory _evidenceHashes,
        bool _critical,
        bool _badFaithEvent,
        string memory _eventType
    ) public onlyPlaintiff caseIsActive returns (uint256) {
        uint256 eventId = timeline.length;
        
        timeline.push(TimelineEvent({
            date: _date,
            description: _description,
            evidenceCount: _evidenceHashes.length,
            evidenceHashes: _evidenceHashes,
            timestamp: block.timestamp,
            critical: _critical,
            badFaithEvent: _badFaithEvent,
            eventType: _eventType
        }));
        
        dateToEventId[_date] = eventId;
        
        if (_critical) {
            criticalEventCount++;
        }
        
        if (_badFaithEvent) {
            badFaithEventCount++;
        }
        
        emit TimelineEventAdded(eventId, _date, _description, _critical, _badFaithEvent, block.timestamp);
        
        return eventId;
    }
    
    // ============ RENT PAYMENT FUNCTIONS ============
    
    /**
     * @notice Record rent payment with property condition at time of payment
     */
    function recordRentPayment(
        string memory _month,
        uint256 _amount,
        string memory _datePaid,
        string memory _paymentMethod,
        bool _onTime,
        string memory _propertyCondition,
        bool _badFaithAcceptance,
        bytes32 _receiptHash,
        string memory _ipfsReceipt
    ) public onlyPlaintiff returns (uint256) {
        uint256 paymentId = rentPayments.length;
        
        rentPayments.push(RentPayment({
            month: _month,
            amount: _amount,
            datePaid: _datePaid,
            paymentMethod: _paymentMethod,
            onTime: _onTime,
            propertyCondition: _propertyCondition,
            badFaithAcceptance: _badFaithAcceptance,
            receiptHash: _receiptHash,
            ipfsReceipt: _ipfsReceipt,
            timestamp: block.timestamp
        }));
        
        monthToPaymentId[_month] = paymentId;
        totalRentPaid += _amount;
        totalMonthsPaid++;
        
        if (_onTime) {
            monthsOnTime++;
        }
        
        emit RentPaymentRecorded(paymentId, _month, _amount, _onTime, _badFaithAcceptance, block.timestamp);
        
        return paymentId;
    }
    
    // ============ DAMAGES FUNCTIONS ============
    
    /**
     * @notice Add damage item with supporting evidence
     */
    function addDamageItem(
        string memory _category,
        string memory _description,
        uint256 _amount,
        string memory _calculation,
        bytes32[] memory _supportingEvidence,
        string memory _notes
    ) public onlyPlaintiff returns (uint256) {
        uint256 damageId = damages.length;
        
        damages.push(DamageItem({
            category: _category,
            description: _description,
            amount: _amount,
            calculation: _calculation,
            supportingEvidence: _supportingEvidence,
            verified: true,
            notes: _notes,
            timestamp: block.timestamp
        }));
        
        totalDamages += _amount;
        
        emit DamageItemAdded(damageId, _category, _amount, block.timestamp);
        
        return damageId;
    }
    
    // ============ CASE STATUS FUNCTIONS ============
    
    /**
     * @notice Update case status
     */
    function updateCaseStatus(string memory _newStatus) public onlyPlaintiff {
        caseStatus = _newStatus;
        emit CaseStatusUpdated(_newStatus, block.timestamp);
    }
    
    /**
     * @notice Record settlement reached
     */
    function recordSettlement(uint256 _amount) public onlyPlaintiff {
        settlementReached = true;
        settlementAmount = _amount;
        caseActive = false;
        caseStatus = "Settled";
        
        emit SettlementReached(_amount, block.timestamp);
    }
    
    /**
     * @notice Close case
     */
    function closeCase(string memory _outcome) public onlyPlaintiff {
        caseActive = false;
        caseStatus = _outcome;
        emit CaseStatusUpdated(_outcome, block.timestamp);
    }
    
    // ============ GETTER FUNCTIONS ============
    
    function getEvidenceCount() public view returns (uint256) {
        return evidenceChain.length;
    }
    
    function getTimelineCount() public view returns (uint256) {
        return timeline.length;
    }
    
    function getRentPaymentCount() public view returns (uint256) {
        return rentPayments.length;
    }
    
    function getDamageCount() public view returns (uint256) {
        return damages.length;
    }
    
    function getEvidence(uint256 _id) public view returns (Evidence memory) {
        require(_id < evidenceChain.length, "Evidence ID out of bounds");
        return evidenceChain[_id];
    }
    
    function getTimelineEvent(uint256 _id) public view returns (TimelineEvent memory) {
        require(_id < timeline.length, "Event ID out of bounds");
        return timeline[_id];
    }
    
    function getRentPayment(uint256 _id) public view returns (RentPayment memory) {
        require(_id < rentPayments.length, "Payment ID out of bounds");
        return rentPayments[_id];
    }
    
    function getDamageItem(uint256 _id) public view returns (DamageItem memory) {
        require(_id < damages.length, "Damage ID out of bounds");
        return damages[_id];
    }
    
    /**
     * @notice Get case statistics
     */
    function getCaseStats() public view returns (
        uint256 evidenceCount,
        uint256 timelineEventCount,
        uint256 paymentCount,
        uint256 damageCount,
        uint256 totalRent,
        uint256 onTimePercent,
        uint256 badFaithEvents,
        uint256 criticalEvents,
        uint256 totalDamageAmount
    ) {
        return (
            evidenceChain.length,
            timeline.length,
            rentPayments.length,
            damages.length,
            totalRentPaid,
            totalMonthsPaid > 0 ? (monthsOnTime * 100) / totalMonthsPaid : 0,
            badFaithEventCount,
            criticalEventCount,
            totalDamages
        );
    }
    
    /**
     * @notice Get payment reliability percentage (for showing perfect payment record)
     */
    function getPaymentReliability() public view returns (uint256 percentage) {
        if (totalMonthsPaid == 0) return 0;
        return (monthsOnTime * 100) / totalMonthsPaid;
    }
}
