// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CBDCBridge
 * @dev Bridge between Faith Chain and Central Bank Digital Currencies
 */
contract CBDCBridge {
    
    struct CBDC {
        string name;
        string symbol;
        address issuer;  // Central bank
        uint256 totalSupply;
        bool active;
    }
    
    mapping(string => CBDC) public cbdcs;  // "USD-CBDC", "EUR-CBDC", etc.
    mapping(address => mapping(string => uint256)) public balances;
    
    event CBDCRegistered(string indexed currencyCode, address issuer);
    event CBDCMinted(string indexed currencyCode, address to, uint256 amount);
    event CBDCBurned(string indexed currencyCode, address from, uint256 amount);
    event CBDCTransfer(string indexed currencyCode, address from, address to, uint256 amount);
    
    modifier onlyIssuer(string memory currencyCode) {
        require(msg.sender == cbdcs[currencyCode].issuer, "Not authorized issuer");
        _;
    }
    
    /**
     * @dev Register new CBDC
     */
    function registerCBDC(
        string memory currencyCode,
        string memory name,
        string memory symbol
    ) external {
        require(cbdcs[currencyCode].issuer == address(0), "CBDC already exists");
        
        cbdcs[currencyCode] = CBDC({
            name: name,
            symbol: symbol,
            issuer: msg.sender,
            totalSupply: 0,
            active: true
        });
        
        emit CBDCRegistered(currencyCode, msg.sender);
    }
    
    /**
     * @dev Mint CBDC (central bank only)
     */
    function mint(
        string memory currencyCode,
        address to,
        uint256 amount
    ) external onlyIssuer(currencyCode) {
        cbdcs[currencyCode].totalSupply += amount;
        balances[to][currencyCode] += amount;
        
        emit CBDCMinted(currencyCode, to, amount);
    }
    
    /**
     * @dev Transfer CBDC
     */
    function transfer(
        string memory currencyCode,
        address to,
        uint256 amount
    ) external {
        require(balances[msg.sender][currencyCode] >= amount, "Insufficient balance");
        
        balances[msg.sender][currencyCode] -= amount;
        balances[to][currencyCode] += amount;
        
        emit CBDCTransfer(currencyCode, msg.sender, to, amount);
    }
    
    /**
     * @dev Get balance
     */
    function balanceOf(address account, string memory currencyCode) external view returns (uint256) {
        return balances[account][currencyCode];
    }
}
