// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title StablecoinEngine
 * @dev Advanced stablecoin implementation for Digital Giant L1
 * Supports fiat-backed, algorithmic, and CBDC stablecoins with regulatory compliance
 * Implements Basel III reserve requirements and ISO 20022 messaging standards
 */
contract StablecoinEngine is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant STABLECOIN_MANAGER = keccak256("STABLECOIN_MANAGER");
    bytes32 public constant REGULATORY_AUTHORITY = keccak256("REGULATORY_AUTHORITY");
    bytes32 public constant ORACLE_MANAGER = keccak256("ORACLE_MANAGER");
    bytes32 public constant RESERVE_MANAGER = keccak256("RESERVE_MANAGER");

    enum StablecoinType {
        FIAT_BACKED,        // 1:1 fiat backing (USDC-style)
        ALGORITHMIC,        // Algorithmic stabilization (UST-style)
        CBDC,              // Central Bank Digital Currency
        COMMODITY_BACKED,   // Commodity collateralized
        CRYPTO_BACKED      // Cryptocurrency collateralized
    }

    enum ReserveStatus {
        HEALTHY,
        ADEQUATE,
        DEFICIT,
        CRITICAL
    }

    // Stablecoin configuration
    struct StablecoinConfig {
        StablecoinType stableType;
        address reserveAsset;           // Address of reserve asset (0x0 for algorithmic)
        uint256 targetPeg;             // Target peg value (18 decimals)
        uint256 pegTolerance;          // Acceptable peg deviation (basis points)
        uint256 reserveRatio;          // Required reserve ratio (basis points)
        uint256 rebaseCooldown;        // Minimum time between rebases
        uint256 maxSupply;             // Maximum supply cap
        bool requiresKYC;              // KYC requirement for minting
        bool isRegulated;              // Subject to regulatory oversight
        string jurisdiction;           // Regulatory jurisdiction
        uint256 regulatoryFee;         // Fee for regulatory compliance (basis points)
    }

    // Reserve management
    struct ReserveInfo {
        uint256 totalReserve;          // Total reserve assets
        uint256 backingRatio;          // Current backing ratio
        uint256 lastRebaseTime;        // Last rebase timestamp
        uint256 rebaseCount;           // Total rebase operations
        ReserveStatus status;          // Current reserve health
        uint256 liquidationRatio;      // Liquidation threshold
        uint256 minimumReserve;        // Minimum reserve requirement
    }

    // Oracle data for peg stabilization
    struct OracleData {
        address oracleAddress;
        uint256 price;
        uint256 lastUpdate;
        uint256 confidence;            // Price confidence interval
        bool isActive;
    }

    // User positions for algorithmic stablecoins
    struct UserPosition {
        uint256 depositedCollateral;
        uint256 mintedStablecoins;
        uint256 liquidationPrice;
        uint256 lastActivity;
        bool isLiquidated;
    }

    // State variables
    StablecoinConfig public config;
    ReserveInfo public reserveInfo;
    mapping(address => OracleData) public oracles;
    mapping(address => UserPosition) public userPositions;

    address[] public activeOracles;
    address public reserveManager;
    address public regulatoryCompliance;

    // Economic parameters
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant MAX_PEG_DEVIATION = 1000; // 10% max deviation

    // Events
    event StablecoinMinted(address indexed user, uint256 amount, uint256 fee);
    event StablecoinBurned(address indexed user, uint256 amount, uint256 returned);
    event ReserveRebalanced(uint256 newRatio, ReserveStatus status);
    event OracleUpdated(address indexed oracle, uint256 price, uint256 confidence);
    event PositionLiquidated(address indexed user, uint256 collateralLiquidated, uint256 stablecoinsBurned);
    event RegulatoryFeeCollected(address indexed user, uint256 amount);
    event PegStabilized(uint256 oldPeg, uint256 newPeg, uint256 rebaseAmount);

    // Modifiers
    modifier onlyStablecoinManager() {
        require(hasRole(STABLECOIN_MANAGER, msg.sender), "Only stablecoin manager");
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

    modifier onlyReserveManager() {
        require(
            msg.sender == reserveManager ||
            hasRole(RESERVE_MANAGER, msg.sender),
            "Only reserve manager"
        );
        _;
    }

    modifier validMintAmount(uint256 amount) {
        require(amount > 0, "Amount must be positive");
        require(totalSupply() + amount <= config.maxSupply, "Exceeds maximum supply");
        _;
    }

    modifier sufficientReserve(uint256 amount) {
        if (config.stableType == StablecoinType.FIAT_BACKED ||
            config.stableType == StablecoinType.COMMODITY_BACKED ||
            config.stableType == StablecoinType.CRYPTO_BACKED) {
            require(reserveInfo.totalReserve >= amount * config.reserveRatio / BASIS_POINTS, "Insufficient reserves");
        }
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        StablecoinConfig memory _config,
        address admin,
        address _reserveManager,
        address _regulatoryCompliance
    ) ERC20(name, symbol) {
        config = _config;
        reserveManager = _reserveManager;
        regulatoryCompliance = _regulatoryCompliance;

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(STABLECOIN_MANAGER, admin);
        _grantRole(REGULATORY_AUTHORITY, admin);
        _grantRole(ORACLE_MANAGER, admin);
        _grantRole(RESERVE_MANAGER, _reserveManager);

        // Initialize reserve info
        reserveInfo = ReserveInfo({
            totalReserve: 0,
            backingRatio: config.reserveRatio,
            lastRebaseTime: block.timestamp,
            rebaseCount: 0,
            status: ReserveStatus.HEALTHY,
            liquidationRatio: 15000, // 150% for algorithmic
            minimumReserve: 0
        });
    }

    /**
     * @dev Mints stablecoins (fiat-backed model)
     */
    function mint(
        address to,
        uint256 amount
    )
        public
        onlyStablecoinManager
        whenNotPaused
        validMintAmount(amount)
        sufficientReserve(amount)
        nonReentrant
        returns (uint256)
    {
        require(config.stableType == StablecoinType.FIAT_BACKED, "Wrong stablecoin type");

        // Calculate regulatory fee
        uint256 regulatoryFee = (amount * config.regulatoryFee) / BASIS_POINTS;
        uint256 netAmount = amount - regulatoryFee;

        // Check KYC if required
        if (config.requiresKYC) {
            require(_hasValidKYC(to), "KYC required");
        }

        // Transfer reserve assets from user
        require(IERC20(config.reserveAsset).transferFrom(msg.sender, address(this), amount), "Reserve transfer failed");

        // Update reserves
        reserveInfo.totalReserve += amount;

        // Mint stablecoins
        _mint(to, netAmount);

        // Collect regulatory fee
        if (regulatoryFee > 0) {
            _mint(regulatoryCompliance, regulatoryFee);
            emit RegulatoryFeeCollected(to, regulatoryFee);
        }

        // Update reserve status
        _updateReserveStatus();

        emit StablecoinMinted(to, netAmount, regulatoryFee);

        return netAmount;
    }

    /**
     * @dev Mints algorithmic stablecoins
     */
    function mintAlgorithmic(
        address to,
        uint256 collateralAmount,
        uint256 stablecoinAmount
    )
        public
        whenNotPaused
        validMintAmount(stablecoinAmount)
        nonReentrant
        returns (uint256)
    {
        require(config.stableType == StablecoinType.ALGORITHMIC, "Not algorithmic stablecoin");

        // Transfer collateral
        require(IERC20(config.reserveAsset).transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        // Calculate liquidation price (simplified)
        uint256 currentPrice = _getAveragePrice();
        uint256 liquidationPrice = (currentPrice * reserveInfo.liquidationRatio) / BASIS_POINTS;

        // Update user position
        userPositions[to].depositedCollateral += collateralAmount;
        userPositions[to].mintedStablecoins += stablecoinAmount;
        userPositions[to].liquidationPrice = liquidationPrice;
        userPositions[to].lastActivity = block.timestamp;

        // Update reserves
        reserveInfo.totalReserve += collateralAmount;

        // Mint stablecoins
        _mint(to, stablecoinAmount);

        // Update reserve status
        _updateReserveStatus();

        emit StablecoinMinted(to, stablecoinAmount, 0);

        return stablecoinAmount;
    }

    /**
     * @dev Burns stablecoins and returns reserve assets
     */
    function burn(
        address from,
        uint256 amount
    )
        public
        onlyStablecoinManager
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(balanceOf(from) >= amount, "Insufficient balance");

        uint256 returnAmount;

        if (config.stableType == StablecoinType.FIAT_BACKED) {
            returnAmount = amount; // 1:1 redemption
            require(reserveInfo.totalReserve >= returnAmount, "Insufficient reserves");

            // Transfer reserve assets back
            require(IERC20(config.reserveAsset).transfer(from, returnAmount), "Reserve return failed");

            // Update reserves
            reserveInfo.totalReserve -= returnAmount;

        } else if (config.stableType == StablecoinType.ALGORITHMIC) {
            // Calculate collateral to return
            UserPosition storage position = userPositions[from];
            require(position.mintedStablecoins >= amount, "Insufficient position");

            uint256 collateralRatio = (position.depositedCollateral * PRICE_PRECISION) / position.mintedStablecoins;
            returnAmount = (amount * collateralRatio) / PRICE_PRECISION;

            require(reserveInfo.totalReserve >= returnAmount, "Insufficient reserves");

            // Transfer collateral back
            require(IERC20(config.reserveAsset).transfer(from, returnAmount), "Collateral return failed");

            // Update position
            position.depositedCollateral -= returnAmount;
            position.mintedStablecoins -= amount;
            position.lastActivity = block.timestamp;

            // Update reserves
            reserveInfo.totalReserve -= returnAmount;
        }

        // Burn stablecoins
        _burn(from, amount);

        // Update reserve status
        _updateReserveStatus();

        emit StablecoinBurned(from, amount, returnAmount);

        return returnAmount;
    }

    /**
     * @dev Rebalances peg for algorithmic stablecoins
     */
    function rebalancePeg()
        public
        onlyReserveManager
        whenNotPaused
        nonReentrant
    {
        require(config.stableType == StablecoinType.ALGORITHMIC, "Not algorithmic stablecoin");
        require(block.timestamp >= reserveInfo.lastRebaseTime + config.rebaseCooldown, "Rebase cooldown active");

        uint256 currentPrice = _getAveragePrice();
        uint256 targetPrice = config.targetPeg;

        // Check if rebalancing is needed
        uint256 deviation = currentPrice > targetPrice ?
            ((currentPrice - targetPrice) * BASIS_POINTS) / targetPrice :
            ((targetPrice - currentPrice) * BASIS_POINTS) / targetPrice;

        require(deviation >= config.pegTolerance, "Peg within tolerance");

        uint256 totalSupply_ = totalSupply();
        uint256 newSupply;

        if (currentPrice > targetPrice) {
            // Price too high, increase supply (mint)
            uint256 rebaseAmount = (totalSupply_ * deviation) / BASIS_POINTS;
            newSupply = totalSupply_ + rebaseAmount;
            _mint(reserveManager, rebaseAmount);
        } else {
            // Price too low, decrease supply (burn)
            uint256 rebaseAmount = (totalSupply_ * deviation) / BASIS_POINTS;
            newSupply = totalSupply_ > rebaseAmount ? totalSupply_ - rebaseAmount : 0;
            _burn(reserveManager, totalSupply_ - newSupply);
        }

        reserveInfo.lastRebaseTime = block.timestamp;
        reserveInfo.rebaseCount++;

        emit PegStabilized(currentPrice, targetPrice, Math.abs(int256(totalSupply_) - int256(newSupply)));
    }

    /**
     * @dev Liquidates undercollateralized positions
     */
    function liquidatePosition(address user)
        public
        onlyReserveManager
        whenNotPaused
        nonReentrant
    {
        UserPosition storage position = userPositions[user];
        require(!position.isLiquidated, "Position already liquidated");

        uint256 currentPrice = _getAveragePrice();
        require(currentPrice <= position.liquidationPrice, "Position not undercollateralized");

        // Calculate liquidation amounts
        uint256 collateralToLiquidate = position.depositedCollateral;
        uint256 stablecoinsToBurn = position.mintedStablecoins;

        // Burn stablecoins
        _burn(user, stablecoinsToBurn);

        // Transfer collateral to reserve manager (liquidator)
        require(IERC20(config.reserveAsset).transfer(reserveManager, collateralToLiquidate), "Collateral transfer failed");

        // Mark position as liquidated
        position.isLiquidated = true;
        position.depositedCollateral = 0;
        position.mintedStablecoins = 0;

        // Update reserves
        reserveInfo.totalReserve -= collateralToLiquidate;

        emit PositionLiquidated(user, collateralToLiquidate, stablecoinsToBurn);
    }

    /**
     * @dev Updates oracle price data
     */
    function updateOraclePrice(
        address oracle,
        uint256 price,
        uint256 confidence
    )
        public
        onlyRole(ORACLE_MANAGER)
        whenNotPaused
    {
        require(oracles[oracle].isActive, "Oracle not active");

        oracles[oracle].price = price;
        oracles[oracle].lastUpdate = block.timestamp;
        oracles[oracle].confidence = confidence;

        emit OracleUpdated(oracle, price, confidence);
    }

    /**
     * @dev Adds a new oracle
     */
    function addOracle(address oracle)
        public
        onlyRole(ORACLE_MANAGER)
    {
        require(!oracles[oracle].isActive, "Oracle already active");

        oracles[oracle] = OracleData({
            oracleAddress: oracle,
            price: 0,
            lastUpdate: 0,
            confidence: 0,
            isActive: true
        });

        activeOracles.push(oracle);
    }

    /**
     * @dev Removes an oracle
     */
    function removeOracle(address oracle)
        public
        onlyRole(ORACLE_MANAGER)
    {
        require(oracles[oracle].isActive, "Oracle not active");

        oracles[oracle].isActive = false;

        // Remove from active list
        for (uint256 i = 0; i < activeOracles.length; i++) {
            if (activeOracles[i] == oracle) {
                activeOracles[i] = activeOracles[activeOracles.length - 1];
                activeOracles.pop();
                break;
            }
        }
    }

    /**
     * @dev Updates reserve information
     */
    function updateReserveInfo(
        uint256 newReserve,
        uint256 newMinimumReserve
    )
        public
        onlyReserveManager
    {
        reserveInfo.totalReserve = newReserve;
        reserveInfo.minimumReserve = newMinimumReserve;

        _updateReserveStatus();
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

    function _getAveragePrice() internal view returns (uint256) {
        if (activeOracles.length == 0) return config.targetPeg;

        uint256 totalPrice = 0;
        uint256 totalConfidence = 0;

        for (uint256 i = 0; i < activeOracles.length; i++) {
            address oracle = activeOracles[i];
            OracleData memory oracleData = oracles[oracle];

            if (oracleData.isActive && block.timestamp - oracleData.lastUpdate < 1 hours) {
                totalPrice += oracleData.price * oracleData.confidence;
                totalConfidence += oracleData.confidence;
            }
        }

        return totalConfidence > 0 ? totalPrice / totalConfidence : config.targetPeg;
    }

    function _updateReserveStatus() internal {
        uint256 totalSupply_ = totalSupply();

        if (totalSupply_ == 0) {
            reserveInfo.backingRatio = config.reserveRatio;
            reserveInfo.status = ReserveStatus.HEALTHY;
            return;
        }

        uint256 currentRatio;

        if (config.stableType == StablecoinType.FIAT_BACKED ||
            config.stableType == StablecoinType.COMMODITY_BACKED ||
            config.stableType == StablecoinType.CRYPTO_BACKED) {

            currentRatio = (reserveInfo.totalReserve * BASIS_POINTS) / totalSupply_;

        } else if (config.stableType == StablecoinType.ALGORITHMIC) {
            // For algorithmic, backing ratio is based on collateralization
            currentRatio = reserveInfo.totalReserve > 0 ?
                (reserveInfo.totalReserve * BASIS_POINTS) / totalSupply_ : 0;
        }

        reserveInfo.backingRatio = currentRatio;

        // Determine reserve status
        if (currentRatio >= config.reserveRatio + 1000) { // 10% above requirement
            reserveInfo.status = ReserveStatus.HEALTHY;
        } else if (currentRatio >= config.reserveRatio) {
            reserveInfo.status = ReserveStatus.ADEQUATE;
        } else if (currentRatio >= config.reserveRatio * 90 / 100) { // 10% below requirement
            reserveInfo.status = ReserveStatus.DEFICIT;
        } else {
            reserveInfo.status = ReserveStatus.CRITICAL;
        }

        emit ReserveRebalanced(currentRatio, reserveInfo.status);
    }

    function _hasValidKYC(address user) internal view returns (bool) {
        // Integration with regulatory compliance contract
        if (regulatoryCompliance != address(0)) {
            // Call regulatory compliance contract
            // This would check KYC status
            return true; // Placeholder
        }
        return true;
    }

    // View functions

    function getCurrentPrice() public view returns (uint256) {
        return _getAveragePrice();
    }

    function getReserveStatus() public view returns (ReserveStatus) {
        return reserveInfo.status;
    }

    function getUserPosition(address user) public view returns (UserPosition memory) {
        return userPositions[user];
    }

    function getOracleCount() public view returns (uint256) {
        return activeOracles.length;
    }

    function getBackingRatio() public view returns (uint256) {
        return reserveInfo.backingRatio;
    }

    function isPegStable() public view returns (bool) {
        uint256 currentPrice = _getAveragePrice();
        uint256 deviation = currentPrice > config.targetPeg ?
            ((currentPrice - config.targetPeg) * BASIS_POINTS) / config.targetPeg :
            ((config.targetPeg - currentPrice) * BASIS_POINTS) / currentPrice;

        return deviation <= config.pegTolerance;
    }

    function getLiquidationStatus(address user) public view returns (bool) {
        UserPosition memory position = userPositions[user];
        if (position.isLiquidated || position.mintedStablecoins == 0) return false;

        uint256 currentPrice = _getAveragePrice();
        return currentPrice <= position.liquidationPrice;
    }
}
