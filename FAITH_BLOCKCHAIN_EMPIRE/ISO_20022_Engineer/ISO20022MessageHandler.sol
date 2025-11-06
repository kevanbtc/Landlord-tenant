// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISO20022MessageHandler
 * @dev Handles ISO 20022 compliant financial messages on-chain
 */
contract ISO20022MessageHandler {
    
    struct PaymentMessage {
        string messageType; // pacs.008, pacs.009, etc.
        address sender;
        address receiver;
        uint256 amount;
        string currency;
        string reference;
        bytes32 instructionId;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(bytes32 => PaymentMessage) public messages;
    mapping(address => bool) public authorizedInstitutions;
    
    event ISO20022MessageCreated(bytes32 indexed messageId, string messageType);
    event ISO20022MessageProcessed(bytes32 indexed messageId);
    
    modifier onlyAuthorized() {
        require(authorizedInstitutions[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * @dev Create pacs.008 (Payment Initiation) message
     */
    function createPacs008(
        address receiver,
        uint256 amount,
        string memory currency,
        string memory reference
    ) external onlyAuthorized returns (bytes32) {
        bytes32 messageId = keccak256(abi.encodePacked(
            msg.sender, receiver, amount, block.timestamp
        ));
        
        messages[messageId] = PaymentMessage({
            messageType: "pacs.008.001.08",
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            currency: currency,
            reference: reference,
            instructionId: messageId,
            timestamp: block.timestamp,
            processed: false
        });
        
        emit ISO20022MessageCreated(messageId, "pacs.008");
        return messageId;
    }
    
    /**
     * @dev Process payment message
     */
    function processMessage(bytes32 messageId) external onlyAuthorized {
        PaymentMessage storage msg = messages[messageId];
        require(!msg.processed, "Already processed");
        require(msg.receiver == address(0) || msg.receiver == msg.sender, "Invalid receiver");
        
        msg.processed = true;
        emit ISO20022MessageProcessed(messageId);
        
        // Execute payment logic here
    }
    
    /**
     * @dev Add authorized financial institution
     */
    function addAuthorizedInstitution(address institution) external {
        authorizedInstitutions[institution] = true;
    }
}
