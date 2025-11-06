// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DigitalGiantToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    // Certificate system integration
    address public certificateContract;

    // Minting events that trigger certificates
    event TokensMinted(address indexed to, uint256 amount, bytes32 certificateId);
    event TokensBurned(address indexed from, uint256 amount, bytes32 certificateId);

    // Certificate tracking
    mapping(address => uint256) public totalMintedByUser;
    mapping(address => uint256) public totalBurnedByUser;

    // Achievement thresholds
    uint256 public constant FIRST_MINT_THRESHOLD = 1 ether;
    uint256 public constant VOLUME_MILESTONE = 1000 ether;
    uint256 public constant WHALE_THRESHOLD = 10000 ether;

    constructor(
        address _certificateContract,
        uint256 initialSupply
    ) ERC20("Digital Giant Token", "DGT") {
        certificateContract = _certificateContract;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner nonReentrant {
        _mint(to, amount);

        // Update user minting stats
        totalMintedByUser[to] += amount;

        // Generate mint certificate
        bytes32 certificateId = keccak256(abi.encodePacked(
            "mint",
            to,
            amount,
            block.timestamp,
            block.number
        ));

        emit TokensMinted(to, amount, certificateId);

        // Check for achievements
        _checkMintingAchievements(to, amount);
    }

    function burn(uint256 amount) public override nonReentrant {
        _burn(_msgSender(), amount);

        // Update user burning stats
        totalBurnedByUser[_msgSender()] += amount;

        // Generate burn certificate
        bytes32 certificateId = keccak256(abi.encodePacked(
            "burn",
            _msgSender(),
            amount,
            block.timestamp,
            block.number
        ));

        emit TokensBurned(_msgSender(), amount, certificateId);
    }

    function _checkMintingAchievements(address user, uint256 amount) internal {
        uint256 totalMinted = totalMintedByUser[user];

        // First mint achievement
        if (totalMinted >= FIRST_MINT_THRESHOLD && totalMinted - amount < FIRST_MINT_THRESHOLD) {
            _generateAchievementCertificate(user, "first_mint");
        }

        // Volume milestone achievement
        if (totalMinted >= VOLUME_MILESTONE && totalMinted - amount < VOLUME_MILESTONE) {
            _generateAchievementCertificate(user, "volume_milestone");
        }

        // Whale achievement
        if (totalMinted >= WHALE_THRESHOLD && totalMinted - amount < WHALE_THRESHOLD) {
            _generateAchievementCertificate(user, "whale_holder");
        }
    }

    function _generateAchievementCertificate(address user, string memory achievementType) internal {
        // This would integrate with the certificate system
        // For now, we emit an event that the off-chain system can listen to
        bytes32 certificateId = keccak256(abi.encodePacked(
            achievementType,
            user,
            block.timestamp,
            block.number
        ));

        emit AchievementUnlocked(user, achievementType, certificateId);
    }

    event AchievementUnlocked(address indexed user, string achievementType, bytes32 certificateId);

    // Certificate system integration
    function setCertificateContract(address _certificateContract) public onlyOwner {
        certificateContract = _certificateContract;
    }

    // Override transfer to potentially generate transaction certificates
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        super._afterTokenTransfer(from, to, amount);

        // Skip minting/burning events
        if (from == address(0) || to == address(0)) return;

        // Generate transaction certificate for significant transfers
        if (amount >= 100 ether) { // Significant transfer threshold
            bytes32 certificateId = keccak256(abi.encodePacked(
                "large_transfer",
                from,
                to,
                amount,
                block.timestamp,
                block.number
            ));

            emit LargeTransfer(from, to, amount, certificateId);
        }
    }

    event LargeTransfer(address indexed from, address indexed to, uint256 amount, bytes32 certificateId);

    // Emergency functions
    function emergencyPause() public onlyOwner {
        // Implementation for emergency pause
    }

    function emergencyUnpause() public onlyOwner {
        // Implementation for emergency unpause
    }

    // View functions for certificate system
    function getUserStats(address user) public view returns (
        uint256 minted,
        uint256 burned,
        uint256 balance
    ) {
        return (
            totalMintedByUser[user],
            totalBurnedByUser[user],
            balanceOf(user)
        );
    }

    function getAchievementEligibility(address user) public view returns (
        bool firstMintEligible,
        bool volumeMilestoneEligible,
        bool whaleEligible
    ) {
        uint256 minted = totalMintedByUser[user];
        return (
            minted >= FIRST_MINT_THRESHOLD,
            minted >= VOLUME_MILESTONE,
            minted >= WHALE_THRESHOLD
        );
    }
}
