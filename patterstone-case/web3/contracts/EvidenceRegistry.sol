// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev Cross-case evidence management system supporting ML-ready tagging,
 * algorithmic classification, game theory evidence weighting, and tamper-proof storage
 */
contract EvidenceRegistry {
    address public owner;

    // Evidence structure with advanced AI/ML and game theory features
    struct Evidence {
        string evidenceId;
        string caseId;
        string evidenceType;
        string ipfsHash;
        address submitter;
        uint256 timestamp;
        bool exists;
        // ML and algorithmic features
        string[] mlTags;              // ML-generated classification tags
        uint256 relevanceScore;       // 0-100 algorithmic relevance score
        string mlModelHash;           // Hash of ML model used for classification
        uint256 aiConfidence;         // 0-100 AI confidence in classification
        // Game theory features
        uint8 strategicWeight;        // 0-10 strategic importance in game theory
        string playbookReference;     // Link to legal playbook section
        uint256 adversarialValue;     // Calculated adversarial positioning value
        // Learning algorithm data
        uint256 usageCount;           // How many times referenced in analysis
        uint256 successContribution;  // Contribution to case success
        string patternCluster;        // ML cluster for pattern recognition
    }

    // Storage mappings
    mapping(string => Evidence) public evidence; // evidenceId => Evidence
    mapping(string => string[]) public caseEvidence; // caseId => evidenceId[]
    mapping(string => string[]) public tagEvidence; // tag => evidenceId[]
    mapping(string => uint256) public modelPerformance; // modelHash => performance score
    mapping(string => uint256) public playbookUsage; // playbookId => usage count

    string[] public allEvidenceIds;

    // Events
    event EvidenceRegistered(string indexed evidenceId, string indexed caseId, string evidenceType);
    event MLClassificationUpdated(string indexed evidenceId, string[] newTags, uint256 newScore);
    event GameTheoryWeightUpdated(string indexed evidenceId, uint8 newWeight);
    event LearningDataUpdated(string indexed evidenceId, uint256 usageCount, uint256 successContribution);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register new evidence with full AI/ML and game theory metadata
     */
    function registerEvidence(
        string memory _evidenceId,
        string memory _caseId,
        string memory _evidenceType,
        string memory _ipfsHash,
        string[] memory _mlTags,
        uint256 _relevanceScore,
        string memory _mlModelHash,
        uint256 _aiConfidence,
        uint8 _strategicWeight,
        string memory _playbookReference,
        string memory _patternCluster
    ) public {
        require(!evidence[_evidenceId].exists, "Evidence already registered");
        require(_relevanceScore <= 100, "Relevance score must be 0-100");
        require(_aiConfidence <= 100, "AI confidence must be 0-100");
        require(_strategicWeight <= 10, "Strategic weight must be 0-10");

        evidence[_evidenceId] = Evidence({
            evidenceId: _evidenceId,
            caseId: _caseId,
            evidenceType: _evidenceType,
            ipfsHash: _ipfsHash,
            submitter: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            mlTags: _mlTags,
            relevanceScore: _relevanceScore,
            mlModelHash: _mlModelHash,
            aiConfidence: _aiConfidence,
            strategicWeight: _strategicWeight,
            playbookReference: _playbookReference,
            adversarialValue: 0,
            usageCount: 0,
            successContribution: 0,
            patternCluster: _patternCluster
        });

        caseEvidence[_caseId].push(_evidenceId);
        allEvidenceIds.push(_evidenceId);

        // Index by tags for ML queries
        for (uint256 i = 0; i < _mlTags.length; i++) {
            tagEvidence[_mlTags[i]].push(_evidenceId);
        }

        // Update playbook usage
        if (bytes(_playbookReference).length > 0) {
            playbookUsage[_playbookReference]++;
        }

        emit EvidenceRegistered(_evidenceId, _caseId, _evidenceType);
    }

    /**
     * @dev Update ML classification and algorithmic metadata
     */
    function updateMLClassification(
        string memory _evidenceId,
        string[] memory _newTags,
        uint256 _newRelevanceScore,
        string memory _newModelHash,
        uint256 _newConfidence
    ) public onlyOwner {
        require(evidence[_evidenceId].exists, "Evidence not found");
        require(_newRelevanceScore <= 100, "Relevance score must be 0-100");
        require(_newConfidence <= 100, "AI confidence must be 0-100");

        Evidence storage ev = evidence[_evidenceId];

        // Remove old tags from index
        for (uint256 i = 0; i < ev.mlTags.length; i++) {
            // Note: In production, you'd need more sophisticated tag removal
        }

        ev.mlTags = _newTags;
        ev.relevanceScore = _newRelevanceScore;
        ev.mlModelHash = _newModelHash;
        ev.aiConfidence = _newConfidence;

        // Index new tags
        for (uint256 i = 0; i < _newTags.length; i++) {
            tagEvidence[_newTags[i]].push(_evidenceId);
        }

        // Update model performance
        modelPerformance[_newModelHash] += _newRelevanceScore;

        emit MLClassificationUpdated(_evidenceId, _newTags, _newRelevanceScore);
    }

    /**
     * @dev Update game theory strategic weight and adversarial positioning
     */
    function updateGameTheoryWeight(
        string memory _evidenceId,
        uint8 _newStrategicWeight,
        uint256 _adversarialValue,
        string memory _newPlaybookReference
    ) public onlyOwner {
        require(evidence[_evidenceId].exists, "Evidence not found");
        require(_newStrategicWeight <= 10, "Strategic weight must be 0-10");

        Evidence storage ev = evidence[_evidenceId];
        ev.strategicWeight = _newStrategicWeight;
        ev.adversarialValue = _adversarialValue;

        if (bytes(_newPlaybookReference).length > 0) {
            ev.playbookReference = _newPlaybookReference;
            playbookUsage[_newPlaybookReference]++;
        }

        emit GameTheoryWeightUpdated(_evidenceId, _newStrategicWeight);
    }

    /**
     * @dev Update learning algorithm data based on usage and outcomes
     */
    function updateLearningData(
        string memory _evidenceId,
        uint256 _usageIncrement,
        uint256 _successContribution
    ) public onlyOwner {
        require(evidence[_evidenceId].exists, "Evidence not found");

        Evidence storage ev = evidence[_evidenceId];
        ev.usageCount += _usageIncrement;
        ev.successContribution += _successContribution;

        // Update model performance based on success
        modelPerformance[ev.mlModelHash] += _successContribution;

        emit LearningDataUpdated(_evidenceId, ev.usageCount, ev.successContribution);
    }

    // Query functions

    function getEvidence(string memory _evidenceId) public view returns (Evidence memory) {
        require(evidence[_evidenceId].exists, "Evidence not found");
        return evidence[_evidenceId];
    }

    function getCaseEvidence(string memory _caseId) public view returns (string[] memory) {
        return caseEvidence[_caseId];
    }

    function getEvidenceByTag(string memory _tag) public view returns (string[] memory) {
        return tagEvidence[_tag];
    }

    function getAllEvidence() public view returns (string[] memory) {
        return allEvidenceIds;
    }

    function getTotalEvidence() public view returns (uint256) {
        return allEvidenceIds.length;
    }

    /**
     * @dev Get ML model performance analytics
     */
    function getModelPerformance(string memory _modelHash) public view returns (uint256) {
        return modelPerformance[_modelHash];
    }

    /**
     * @dev Get playbook usage analytics
     */
    function getPlaybookUsage(string memory _playbookId) public view returns (uint256) {
        return playbookUsage[_playbookId];
    }

    /**
     * @dev Get evidence sorted by strategic weight (game theory)
     */
    function getHighValueEvidence(string memory _caseId, uint8 _minWeight)
        public view returns (string[] memory) {
        string[] memory caseEvs = caseEvidence[_caseId];
        uint256 count = 0;

        // Count qualifying evidence
        for (uint256 i = 0; i < caseEvs.length; i++) {
            if (evidence[caseEvs[i]].strategicWeight >= _minWeight) {
                count++;
            }
        }

        string[] memory result = new string[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < caseEvs.length; i++) {
            if (evidence[caseEvs[i]].strategicWeight >= _minWeight) {
                result[index] = caseEvs[i];
                index++;
            }
        }

        return result;
    }
}
