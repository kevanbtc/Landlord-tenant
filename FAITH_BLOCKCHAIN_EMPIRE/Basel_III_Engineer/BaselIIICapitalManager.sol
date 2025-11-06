// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaselIIICapitalManager
 * @dev Manages Basel III capital requirements on-chain
 */
contract BaselIIICapitalManager {
    
    struct Bank {
        address bankAddress;
        uint256 tier1Capital;  // Common Equity Tier 1
        uint256 tier2Capital;  // Additional Tier 1 + Tier 2
        uint256 riskWeightedAssets;
        uint256 leverageRatio;
        bool compliant;
    }
    
    mapping(address => Bank) public banks;
    
    // Basel III minimum requirements
    uint256 public constant MIN_CET1_RATIO = 45; // 4.5%
    uint256 public constant MIN_TIER1_RATIO = 60; // 6%
    uint256 public constant MIN_TOTAL_RATIO = 80; // 8%
    uint256 public constant MIN_LEVERAGE_RATIO = 30; // 3%
    
    event BankRegistered(address indexed bank);
    event CapitalUpdated(address indexed bank, uint256 tier1, uint256 tier2);
    event ComplianceStatusChanged(address indexed bank, bool compliant);
    
    /**
     * @dev Register bank for Basel III monitoring
     */
    function registerBank(
        uint256 tier1Capital,
        uint256 tier2Capital,
        uint256 riskWeightedAssets
    ) external {
        banks[msg.sender] = Bank({
            bankAddress: msg.sender,
            tier1Capital: tier1Capital,
            tier2Capital: tier2Capital,
            riskWeightedAssets: riskWeightedAssets,
            leverageRatio: calculateLeverageRatio(tier1Capital, riskWeightedAssets),
            compliant: false
        });
        
        updateComplianceStatus(msg.sender);
        emit BankRegistered(msg.sender);
    }
    
    /**
     * @dev Check if bank meets Basel III requirements
     */
    function checkCompliance(address bank) public view returns (bool) {
        Bank memory b = banks[bank];
        
        uint256 cet1Ratio = (b.tier1Capital * 1000) / b.riskWeightedAssets;
        uint256 tier1Ratio = (b.tier1Capital * 1000) / b.riskWeightedAssets;
        uint256 totalRatio = ((b.tier1Capital + b.tier2Capital) * 1000) / b.riskWeightedAssets;
        
        return cet1Ratio >= MIN_CET1_RATIO &&
               tier1Ratio >= MIN_TIER1_RATIO &&
               totalRatio >= MIN_TOTAL_RATIO &&
               b.leverageRatio >= MIN_LEVERAGE_RATIO;
    }
    
    /**
     * @dev Calculate leverage ratio
     */
    function calculateLeverageRatio(uint256 tier1, uint256 rwa) internal pure returns (uint256) {
        return (tier1 * 1000) / rwa;
    }
    
    /**
     * @dev Update compliance status
     */
    function updateComplianceStatus(address bank) internal {
        banks[bank].compliant = checkCompliance(bank);
        emit ComplianceStatusChanged(bank, banks[bank].compliant);
    }
}
