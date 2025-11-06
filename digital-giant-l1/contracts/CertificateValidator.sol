// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CertificateValidator is Ownable, ReentrancyGuard {
    // Certificate storage
    struct StoredCertificate {
        bytes32 certificateId;
        address recipient;
        uint256 issuedAt;
        bytes32 contentHash;
        string ipfsUri;
        string arweaveId;
        bool isValid;
        uint256 challengeDeadline;
        address challenger;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    mapping(bytes32 => StoredCertificate) public certificates;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public validatorReputation;

    // Events
    event CertificateRegistered(bytes32 indexed certificateId, address indexed recipient, bytes32 contentHash);
    event CertificateChallenged(bytes32 indexed certificateId, address indexed challenger, string reason);
    event CertificateValidated(bytes32 indexed certificateId, bool isValid);
    event VoteCast(bytes32 indexed certificateId, address indexed voter, bool vote);

    // Configuration
    uint256 public constant CHALLENGE_PERIOD = 7 days;
    uint256 public constant MIN_VOTES_REQUIRED = 5;
    uint256 public constant VALIDATOR_STAKE = 100 ether;

    // Quantum-resistant signature verification (simplified)
    mapping(bytes32 => bool) public verifiedSignatures;

    function registerCertificate(
        bytes32 certificateId,
        address recipient,
        bytes32 contentHash,
        string memory ipfsUri,
        string memory arweaveId,
        bytes memory quantumSignature
    ) public onlyOwner nonReentrant {
        require(certificates[certificateId].certificateId == bytes32(0), "Certificate already exists");
        require(_verifyQuantumSignature(certificateId, quantumSignature), "Invalid quantum signature");

        certificates[certificateId] = StoredCertificate({
            certificateId: certificateId,
            recipient: recipient,
            issuedAt: block.timestamp,
            contentHash: contentHash,
            ipfsUri: ipfsUri,
            arweaveId: arweaveId,
            isValid: true,
            challengeDeadline: block.timestamp + CHALLENGE_PERIOD,
            challenger: address(0),
            votesFor: 0,
            votesAgainst: 0
        });

        emit CertificateRegistered(certificateId, recipient, contentHash);
    }

    function challengeCertificate(bytes32 certificateId, string memory reason) public payable nonReentrant {
        StoredCertificate storage cert = certificates[certificateId];
        require(cert.certificateId != bytes32(0), "Certificate does not exist");
        require(cert.isValid, "Certificate already invalidated");
        require(block.timestamp <= cert.challengeDeadline, "Challenge period expired");
        require(cert.challenger == address(0), "Certificate already challenged");
        require(msg.value >= VALIDATOR_STAKE, "Insufficient stake for challenge");

        cert.challenger = msg.sender;
        cert.challengeDeadline = block.timestamp + CHALLENGE_PERIOD;

        emit CertificateChallenged(certificateId, msg.sender, reason);
    }

    function voteOnChallenge(bytes32 certificateId, bool vote) public nonReentrant {
        StoredCertificate storage cert = certificates[certificateId];
        require(cert.certificateId != bytes32(0), "Certificate does not exist");
        require(cert.challenger != address(0), "Certificate not challenged");
        require(block.timestamp <= cert.challengeDeadline, "Voting period expired");
        require(!hasVoted[certificateId][msg.sender], "Already voted");
        require(validatorReputation[msg.sender] > 0, "Not a registered validator");

        hasVoted[certificateId][msg.sender] = true;

        if (vote) {
            cert.votesFor++;
        } else {
            cert.votesAgainst++;
        }

        emit VoteCast(certificateId, msg.sender, vote);

        // Check if voting is complete
        _checkVotingResult(certificateId);
    }

    function _checkVotingResult(bytes32 certificateId) internal {
        StoredCertificate storage cert = certificates[certificateId];

        uint256 totalVotes = cert.votesFor + cert.votesAgainst;

        if (totalVotes >= MIN_VOTES_REQUIRED) {
            bool isValid = cert.votesFor > cert.votesAgainst;

            if (!isValid) {
                cert.isValid = false;
                // Return stake to challenger
                payable(cert.challenger).transfer(VALIDATOR_STAKE);
            } else {
                // Burn the challenger's stake as penalty
                // In practice, this could go to a treasury
            }

            emit CertificateValidated(certificateId, isValid);
        }
    }

    function registerValidator(address validator) public onlyOwner {
        validatorReputation[validator] = 100; // Base reputation score
    }

    function updateValidatorReputation(address validator, int256 reputationChange) public onlyOwner {
        if (reputationChange > 0) {
            validatorReputation[validator] += uint256(reputationChange);
        } else {
            uint256 decrease = uint256(-reputationChange);
            if (validatorReputation[validator] > decrease) {
                validatorReputation[validator] -= decrease;
            } else {
                validatorReputation[validator] = 0;
            }
        }
    }

    function _verifyQuantumSignature(bytes32 certificateId, bytes memory signature) internal returns (bool) {
        // Simplified quantum signature verification
        // In production, this would use actual PQC verification
        bytes32 signatureHash = keccak256(signature);
        verifiedSignatures[signatureHash] = true;
        return true;
    }

    function verifyCertificate(bytes32 certificateId) public view returns (bool) {
        StoredCertificate memory cert = certificates[certificateId];
        if (cert.certificateId == bytes32(0)) return false;

        // Check if challenged and voting completed
        if (cert.challenger != address(0)) {
            uint256 totalVotes = cert.votesFor + cert.votesAgainst;
            if (totalVotes >= MIN_VOTES_REQUIRED) {
                return cert.votesFor > cert.votesAgainst;
            }
            // If challenged but voting not complete, consider valid until proven otherwise
        }

        return cert.isValid;
    }

    function getCertificate(bytes32 certificateId) public view returns (StoredCertificate memory) {
        return certificates[certificateId];
    }

    function getCertificateTrustScore(bytes32 certificateId) public view returns (uint256) {
        StoredCertificate memory cert = certificates[certificateId];
        if (cert.certificateId == bytes32(0)) return 0;

        uint256 score = 100;

        // Deduct for challenges
        if (cert.challenger != address(0)) {
            score -= 20;
        }

        // Deduct for age (older certificates slightly less trusted)
        uint256 age = block.timestamp - cert.issuedAt;
        uint256 agePenalty = age / (365 days) * 5; // 5 points per year
        score -= agePenalty;

        return score > 100 ? 100 : score;
    }

    function withdrawStaleChallenges() public onlyOwner {
        // Allow withdrawal of stakes from very old challenges
        // Implementation would iterate through old challenged certificates
    }

    // Emergency functions
    function emergencyRevokeCertificate(bytes32 certificateId) public onlyOwner {
        StoredCertificate storage cert = certificates[certificateId];
        require(cert.certificateId != bytes32(0), "Certificate does not exist");

        cert.isValid = false;
        emit CertificateValidated(certificateId, false);
    }

    function emergencyRestoreCertificate(bytes32 certificateId) public onlyOwner {
        StoredCertificate storage cert = certificates[certificateId];
        require(cert.certificateId != bytes32(0), "Certificate does not exist");

        cert.isValid = true;
        cert.challenger = address(0);
        cert.votesFor = 0;
        cert.votesAgainst = 0;
        emit CertificateValidated(certificateId, true);
    }
}
