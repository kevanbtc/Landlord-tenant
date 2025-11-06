// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TenantJusticeRegistry
 * @dev Advanced multi-case registry supporting AI/ML integration, game theory algorithms,
 * legal playbooks, machine learning scenarios, and learning capabilities for legal dominance
 */
contract TenantJusticeRegistry {
    address public owner;

    // Core data structures
    struct Case {
        string caseId;
        string jurisdiction;
        string summaryIPFS;
        address plaintiff;
        uint256 timestamp;
        bool exists;
        // AI/ML metadata
        string mlModelHash;           // Hash of ML model used for analysis
        uint256 aiConfidenceScore;    // 0-100 confidence score
        string[] algorithmicTags;     // ML-generated classification tags
        // Game theory state
        uint8 strategicPosition;      // 0=defensive, 1=balanced, 2=aggressive
        string currentPlaybook;       // Reference to legal playbook strategy
        uint256 adversarialScore;     // Game theory adversarial positioning
        // Learning algorithm data
        uint256 predictedOutcome;     // ML-predicted case value
        uint256 learningWeight;       // Weight for future ML training
        string patternMatchId;        // Reference to similar case patterns
    }

    struct Evidence {
        string evidenceId;
        string caseId;
        string evidenceType;
        string ipfsHash;
        uint256 timestamp;
        bool exists;
        // Algorithmic classification
        string[] mlTags;              // ML-generated evidence tags
        uint256 relevanceScore;       // 0-100 algorithmic relevance
        uint8 gameTheoryWeight;       // Strategic importance (0-10)
        string playbookReference;     // Link to legal playbook section
    }

    // Storage mappings
    mapping(string => Case) public cases;
    mapping(string => mapping(string => Evidence)) public evidence;
    mapping(string => string[]) public caseEvidenceList;
    string[] public allCaseIds;

    // Analytics and learning data
    mapping(string => uint256) public jurisdictionSuccessRates; // jurisdiction => success %
    mapping(string => uint256) public playbookEffectiveness;    // playbookId => effectiveness score
    mapping(string => uint256) public mlModelPerformance;       // modelHash => performance score

    // Events
    event CaseRegistered(string indexed caseId, string jurisdiction, address plaintiff, uint256 timestamp);
    event EvidenceRegistered(string indexed caseId, string evidenceId, uint256 timestamp);
    event GameTheoryStateUpdated(string indexed caseId, uint8 newPosition, string playbook);
    event LearningDataUpdated(string indexed caseId, uint256 outcome, uint256 weight);
    event MLAnalyticsUpdated(string jurisdiction, uint256 successRate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register a new case with full AI/ML and game theory metadata
     */
    function registerCase(
        string memory _caseId,
        string memory _jurisdiction,
        string memory _summaryIPFS,
        address _plaintiff,
        string memory _mlModelHash,
        uint256 _aiConfidenceScore,
        string[] memory _algorithmicTags,
        uint8 _strategicPosition,
        string memory _currentPlaybook,
        uint256 _adversarialScore,
        uint256 _predictedOutcome
    ) public {
        require(!cases[_caseId].exists, "Case already registered");
        require(_aiConfidenceScore <= 100, "Confidence score must be 0-100");
        require(_strategicPosition <= 2, "Strategic position must be 0-2");

        cases[_caseId] = Case(
            _caseId,
            _jurisdiction,
            _summaryIPFS,
            _plaintiff,
            block.timestamp,
            true,
            _mlModelHash,
            _aiConfidenceScore,
            _algorithmicTags,
            _strategicPosition,
            _currentPlaybook,
            _adversarialScore,
            _predictedOutcome,
            1, // Default learning weight
            ""
        );

        allCaseIds.push(_caseId);

        emit CaseRegistered(_caseId, _jurisdiction, _plaintiff, block.timestamp);
    }

    /**
     * @dev Register evidence with algorithmic classification and game theory weighting
     */
    function registerEvidence(
        string memory _caseId,
        string memory _evidenceId,
        string memory _evidenceType,
        string memory _ipfsHash,
        string[] memory _mlTags,
        uint256 _relevanceScore,
        uint8 _gameTheoryWeight,
        string memory _playbookReference
    ) public {
        require(cases[_caseId].exists, "Case not found");
        require(!evidence[_caseId][_evidenceId].exists, "Evidence already registered");
        require(_relevanceScore <= 100, "Relevance score must be 0-100");
        require(_gameTheoryWeight <= 10, "Game theory weight must be 0-10");

        evidence[_caseId][_evidenceId] = Evidence({
            evidenceId: _evidenceId,
            caseId: _caseId,
            evidenceType: _evidenceType,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            exists: true,
            mlTags: _mlTags,
            relevanceScore: _relevanceScore,
            gameTheoryWeight: _gameTheoryWeight,
            playbookReference: _playbookReference
        });

        caseEvidenceList[_caseId].push(_evidenceId);

        emit EvidenceRegistered(_caseId, _evidenceId, block.timestamp);
    }

    /**
     * @dev Update game theory strategic state and playbook
     */
    function updateGameTheoryState(
        string memory _caseId,
        uint8 _newStrategicPosition,
        string memory _newPlaybook,
        uint256 _newAdversarialScore
    ) public {
        require(cases[_caseId].exists, "Case not found");
        require(_newStrategicPosition <= 2, "Strategic position must be 0-2");

        Case storage caseData = cases[_caseId];
        caseData.strategicPosition = _newStrategicPosition;
        caseData.currentPlaybook = _newPlaybook;
        caseData.adversarialScore = _newAdversarialScore;

        emit GameTheoryStateUpdated(_caseId, _newStrategicPosition, _newPlaybook);
    }

    /**
     * @dev Update learning algorithm data after case resolution
     */
    function updateLearningData(
        string memory _caseId,
        uint256 _actualOutcome,
        uint256 _learningWeight,
        string memory _patternMatchId
    ) public onlyOwner {
        require(cases[_caseId].exists, "Case not found");

        Case storage caseData = cases[_caseId];
        caseData.predictedOutcome = _actualOutcome; // Update with actual outcome
        caseData.learningWeight = _learningWeight;
        caseData.patternMatchId = _patternMatchId;

        // Update jurisdiction success rate (simplified calculation)
        uint256 currentSuccess = jurisdictionSuccessRates[caseData.jurisdiction];
        jurisdictionSuccessRates[caseData.jurisdiction] = (currentSuccess + _learningWeight) / 2;

        // Update playbook effectiveness
        playbookEffectiveness[caseData.currentPlaybook] += _learningWeight;

        // Update ML model performance
        mlModelPerformance[caseData.mlModelHash] += _learningWeight;

        emit LearningDataUpdated(_caseId, _actualOutcome, _learningWeight);
        emit MLAnalyticsUpdated(caseData.jurisdiction, jurisdictionSuccessRates[caseData.jurisdiction]);
    }

    // Query functions

    function getCase(string memory _caseId) public view returns (Case memory) {
        require(cases[_caseId].exists, "Case not found");
        return cases[_caseId];
    }

    function getEvidence(string memory _caseId, string memory _evidenceId)
        public view returns (Evidence memory) {
        require(evidence[_caseId][_evidenceId].exists, "Evidence not found");
        return evidence[_caseId][_evidenceId];
    }

    function getCaseEvidenceList(string memory _caseId)
        public view returns (string[] memory) {
        return caseEvidenceList[_caseId];
    }

    function getAllCases() public view returns (string[] memory) {
        return allCaseIds;
    }

    function getTotalCases() public view returns (uint256) {
        return allCaseIds.length;
    }

    /**
     * @dev Get AI-driven analytics for jurisdiction
     */
    function getJurisdictionAnalytics(string memory _jurisdiction)
        public view returns (uint256 successRate, uint256 totalCases) {
        successRate = jurisdictionSuccessRates[_jurisdiction];
        // Count cases in jurisdiction (simplified - would need more complex logic for production)
        totalCases = 0;
        for (uint256 i = 0; i < allCaseIds.length; i++) {
            if (keccak256(bytes(cases[allCaseIds[i]].jurisdiction)) == keccak256(bytes(_jurisdiction))) {
                totalCases++;
            }
        }
    }

    /**
     * @dev Get playbook effectiveness analytics
     */
    function getPlaybookAnalytics(string memory _playbookId)
        public view returns (uint256 effectiveness) {
        return playbookEffectiveness[_playbookId];
    }

    /**
     * @dev Get ML model performance analytics
     */
    function getMLModelAnalytics(string memory _modelHash)
        public view returns (uint256 performance) {
        return mlModelPerformance[_modelHash];
    }
}
