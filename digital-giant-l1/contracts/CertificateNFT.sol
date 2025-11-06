// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertificateNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Certificate types
    enum CertificateType {
        GENESIS,
        MINT,
        MILESTONE,
        ACHIEVEMENT,
        VALIDATOR
    }

    struct Certificate {
        CertificateType certType;
        address recipient;
        uint256 issuedAt;
        string metadataURI;
        bytes32 certificateId;
        bool isValid;
        uint256 rarity;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(bytes32 => uint256) public certificateIdToTokenId;
    mapping(address => uint256[]) public userCertificates;

    // Events
    event CertificateMinted(uint256 indexed tokenId, bytes32 indexed certificateId, address indexed recipient, CertificateType certType);
    event CertificateRevoked(uint256 indexed tokenId, bytes32 indexed certificateId);
    event CertificateValidated(uint256 indexed tokenId, bytes32 indexed certificateId);

    constructor() ERC721("Digital Giant L1 Certificate", "DGCERT") {}

    function mintCertificate(
        address recipient,
        CertificateType certType,
        string memory metadataURI,
        bytes32 certificateId,
        uint256 rarity
    ) public onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        certificates[tokenId] = Certificate({
            certType: certType,
            recipient: recipient,
            issuedAt: block.timestamp,
            metadataURI: metadataURI,
            certificateId: certificateId,
            isValid: true,
            rarity: rarity
        });

        certificateIdToTokenId[certificateId] = tokenId;
        userCertificates[recipient].push(tokenId);

        emit CertificateMinted(tokenId, certificateId, recipient, certType);

        return tokenId;
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        require(certificates[tokenId].isValid, "Certificate already revoked");

        certificates[tokenId].isValid = false;
        bytes32 certificateId = certificates[tokenId].certificateId;

        emit CertificateRevoked(tokenId, certificateId);
    }

    function validateCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");

        certificates[tokenId].isValid = true;
        bytes32 certificateId = certificates[tokenId].certificateId;

        emit CertificateValidated(tokenId, certificateId);
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    function getUserCertificates(address user) public view returns (uint256[] memory) {
        return userCertificates[user];
    }

    function isCertificateValid(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) return false;
        return certificates[tokenId].isValid;
    }

    function getCertificateById(bytes32 certificateId) public view returns (uint256, Certificate memory) {
        uint256 tokenId = certificateIdToTokenId[certificateId];
        require(tokenId != 0, "Certificate not found");
        return (tokenId, certificates[tokenId]);
    }

    function getCertificateRarity(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId].rarity;
    }

    function getTotalCertificates() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
