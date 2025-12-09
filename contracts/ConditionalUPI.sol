// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConditionalUPI
 * @notice Escrow-based conditional payment system with deadline refunds and relayer support
 * @dev Supports multiple conditions with unique IDs, escrow mechanism, and role-based access control
 */
contract ConditionalUPI is AccessControl, ReentrancyGuard {
    /// @notice Role identifier for authorized relayers who can trigger conditions
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    /// @notice Counter for generating unique condition IDs
    uint256 private _conditionIdCounter;

    /**
     * @notice Represents a single conditional payment
     * @param id Unique identifier for the condition
     * @param payer Address that created and funded the condition
     * @param payee Address that will receive funds when condition is triggered
     * @param amount Amount of ETH escrowed (in wei)
     * @param deadline Unix timestamp after which payer can request refund
     * @param metadataURI Optional URI pointing to condition metadata (IPFS, etc.)
     * @param executed Whether the condition has been triggered and funds released
     * @param refunded Whether the condition has been refunded to payer
     * @param createdAt Unix timestamp when condition was created
     */
    struct Condition {
        uint256 id;
        address payer;
        address payee;
        uint256 amount;
        uint256 deadline;
        string metadataURI;
        bool executed;
        bool refunded;
        uint256 createdAt;
    }

    /// @notice Mapping from condition ID to Condition struct
    mapping(uint256 => Condition) public conditions;

    /// @notice Emitted when a new condition is created
    event ConditionCreated(
        uint256 indexed conditionId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 deadline,
        string metadataURI
    );

    /// @notice Emitted when a condition is successfully triggered
    event ConditionTriggered(
        uint256 indexed conditionId,
        address indexed triggeredBy,
        bytes32 proofHash
    );

    /// @notice Emitted when a condition is refunded to payer
    event ConditionRefunded(uint256 indexed conditionId, address indexed payer);

    /// @notice Emitted when a new relayer is granted permission
    event RelayerAdded(address indexed relayer);

    /// @notice Emitted when a relayer's permission is revoked
    event RelayerRemoved(address indexed relayer);

    /**
     * @notice Contract constructor - sets deployer as admin and initial relayer
     * @param initialRelayer Address to grant RELAYER_ROLE (can be deployer or separate account)
     */
    constructor(address initialRelayer) {
        require(initialRelayer != address(0), "Invalid relayer address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, initialRelayer);
        
        emit RelayerAdded(initialRelayer);
    }

    /**
     * @notice Create a new conditional payment with escrowed funds
     * @param payee Address that will receive funds when condition is met
     * @param deadline Unix timestamp after which refund is possible
     * @param metadataURI Optional metadata URI (can be empty string)
     * @return conditionId The unique ID of the created condition
     * @dev Requires msg.value > 0 and deadline in the future
     */
    function createCondition(
        address payee,
        uint256 deadline,
        string calldata metadataURI
    ) external payable nonReentrant returns (uint256 conditionId) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(payee != address(0), "Invalid payee address");
        require(deadline > block.timestamp, "Deadline must be in the future");

        conditionId = _conditionIdCounter++;

        conditions[conditionId] = Condition({
            id: conditionId,
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            deadline: deadline,
            metadataURI: metadataURI,
            executed: false,
            refunded: false,
            createdAt: block.timestamp
        });

        emit ConditionCreated(
            conditionId,
            msg.sender,
            payee,
            msg.value,
            deadline,
            metadataURI
        );
    }

    /**
     * @notice Trigger a condition and release funds to payee
     * @param conditionId The ID of the condition to trigger
     * @param proofHash Hash of the proof/evidence that condition was met
     * @dev Only callable by addresses with RELAYER_ROLE or DEFAULT_ADMIN_ROLE
     * @dev Uses CEI pattern: checks, effects, then interaction
     */
    function triggerCondition(uint256 conditionId, bytes32 proofHash)
        external
        nonReentrant
        onlyRole(RELAYER_ROLE)
    {
        Condition storage condition = conditions[conditionId];

        // Checks
        require(condition.amount > 0, "Condition does not exist");
        require(!condition.executed, "Condition already executed");
        require(!condition.refunded, "Condition already refunded");

        // Effects
        condition.executed = true;

        // Interaction
        (bool success, ) = condition.payee.call{value: condition.amount}("");
        require(success, "Transfer to payee failed");

        emit ConditionTriggered(conditionId, msg.sender, proofHash);
    }

    /**
     * @notice Refund escrowed funds to payer after deadline
     * @param conditionId The ID of the condition to refund
     * @dev Only callable by the original payer after deadline has passed
     * @dev Uses CEI pattern: checks, effects, then interaction
     */
    function refundCondition(uint256 conditionId) external nonReentrant {
        Condition storage condition = conditions[conditionId];

        // Checks
        require(condition.amount > 0, "Condition does not exist");
        require(msg.sender == condition.payer, "Only payer can refund");
        require(!condition.executed, "Condition already executed");
        require(!condition.refunded, "Condition already refunded");
        require(block.timestamp > condition.deadline, "Deadline not reached");

        // Effects
        condition.refunded = true;

        // Interaction
        (bool success, ) = condition.payer.call{value: condition.amount}("");
        require(success, "Refund transfer failed");

        emit ConditionRefunded(conditionId, condition.payer);
    }

    /**
     * @notice Add a new relayer address
     * @param relayer Address to grant RELAYER_ROLE
     * @dev Only callable by admin
     */
    function addRelayer(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(relayer != address(0), "Invalid relayer address");
        grantRole(RELAYER_ROLE, relayer);
        emit RelayerAdded(relayer);
    }

    /**
     * @notice Remove a relayer address
     * @param relayer Address to revoke RELAYER_ROLE from
     * @dev Only callable by admin
     */
    function removeRelayer(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(RELAYER_ROLE, relayer);
        emit RelayerRemoved(relayer);
    }

    /**
     * @notice Get detailed information about a condition
     * @param conditionId The ID of the condition to query
     * @return condition The complete Condition struct
     */
    function getCondition(uint256 conditionId)
        external
        view
        returns (Condition memory condition)
    {
        condition = conditions[conditionId];
        require(condition.amount > 0, "Condition does not exist");
    }

    /**
     * @notice Get the total number of conditions created
     * @return count Total number of conditions
     */
    function getConditionCount() external view returns (uint256 count) {
        return _conditionIdCounter;
    }

    /**
     * @notice Check if a condition can be refunded
     * @param conditionId The ID of the condition to check
     * @return canRefund True if condition is eligible for refund
     */
    function canRefund(uint256 conditionId) external view returns (bool canRefund) {
        Condition storage condition = conditions[conditionId];
        return (
            condition.amount > 0 &&
            !condition.executed &&
            !condition.refunded &&
            block.timestamp > condition.deadline
        );
    }

    /**
     * @notice Check if a condition can be triggered
     * @param conditionId The ID of the condition to check
     * @return canTrigger True if condition is eligible to be triggered
     */
    function canTrigger(uint256 conditionId) external view returns (bool canTrigger) {
        Condition storage condition = conditions[conditionId];
        return (
            condition.amount > 0 &&
            !condition.executed &&
            !condition.refunded
        );
    }
}
