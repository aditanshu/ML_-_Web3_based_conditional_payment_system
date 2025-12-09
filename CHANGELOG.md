# Changelog

All notable changes to the ConditionalUPI Smart Contract System.

## [2.0.0] - 2025-12-09

### Added - ConditionalUPI Contract

- **New Smart Contract**: `ConditionalUPI.sol` - Multi-condition escrow system
  - Struct-based condition management with unique IDs
  - Deadline-based refund mechanism
  - Relayer role for automated triggering
  - OpenZeppelin ReentrancyGuard protection
  - OpenZeppelin AccessControl (owner + relayer roles)
  - Comprehensive event emissions
  - Complete NatSpec documentation

### Added - Testing Infrastructure

- **Comprehensive Test Suite**: 46 tests total
  - `test/ConditionalPayment.test.js` - 13 tests for existing contract
  - `test/ConditionalUPI.test.js` - 33 tests for new contract
  - Coverage: deployment, create, trigger, refund, access control, edge cases
  - Time-based testing with Hardhat network helpers
  - Balance change assertions
  - Event emission verification

### Added - Deployment Infrastructure

- **Deployment Scripts**:
  - `scripts/deployUPI.cjs` - Universal deployment script
  - Automatic deployment artifact generation
  - Network detection and configuration
  - Balance checks before deployment
  - Explorer link generation

- **Deployment Artifacts**:
  - `deployments/localhost.json` - Local Hardhat deployment
  - `deployments/sepolia.json` - Sepolia testnet deployment
  - Includes: address, ABI, deployer, relayer, block number, timestamp

- **NPM Scripts**:
  - `npm test` - Run all tests
  - `npm run test:gas` - Run tests with gas reporting
  - `npm run deploy:local` - Deploy to local Hardhat
  - `npm run deploy:sepolia` - Deploy to Sepolia testnet
  - `npm run node` - Start Hardhat node

### Added - Backend Relayer Service

- **Node.js/Express Relayer**: Separate service for automated condition triggering
  - `relayer/server.js` - Express API server
  - `relayer/relayer.js` - Contract interaction service
  - `relayer/package.json` - Dependencies (Express, ethers v6, CORS, rate-limit)
  - `relayer/.env.example` - Configuration template

- **API Endpoints**:
  - `GET /health` - Relayer status and balance
  - `POST /api/conditions` - Store condition metadata
  - `GET /api/conditions/:id` - Get condition status
  - `POST /api/conditions/:id/trigger` - Trigger condition via relayer
  - `GET /api/conditions` - List all conditions (debug)

- **Security Features**:
  - API key authentication for trigger endpoint
  - Rate limiting (configurable)
  - Input validation
  - Error sanitization
  - Gas estimation with 20% safety margin
  - Nonce management for concurrent transactions

### Added - Documentation

- **DEMO_GUIDE.md**: Complete walkthrough
  - Installation instructions
  - Local development workflow
  - Testnet deployment steps
  - Three demo scenarios
  - Validation steps
  - Troubleshooting guide
  - API reference
  - Security notes

- **CHANGELOG.md**: This file

### Changed - Configuration

- **package.json**: 
  - Removed `"type": "module"` for Hardhat compatibility
  - Added deployment scripts
  - Added OpenZeppelin contracts dependency

- **.gitignore**: Updated exclusions
  - Added `relayer/.env`
  - Added `relayer/db.json`
  - Excluded build artifacts
  - Preserved deployment artifacts

- **.env.example**: Updated with all required variables
  - Deployment configuration
  - Relayer configuration
  - Gas reporting options

### Preserved - Existing Functionality

- **ConditionalPayment.sol**: Original contract unchanged
- **Sender/Receiver Components**: Frontend components preserved
- **Flask Backend**: AI intent parsing backend preserved
- **Existing Deployment Scripts**: `deploy.cjs` and `deploy_sepolia.cjs` preserved

### Technical Details

**Smart Contract**:
- Solidity: ^0.8.20
- OpenZeppelin: ^5.1.0
- Security: ReentrancyGuard, AccessControl, CEI pattern
- Gas Optimization: Efficient storage patterns

**Testing**:
- Framework: Hardhat + Mocha + Chai
- Coverage: 46 tests, all passing
- Time manipulation: Hardhat network helpers
- Balance assertions: ethers.js provider

**Backend**:
- Runtime: Node.js (ES modules)
- Framework: Express ^4.18.2
- Blockchain: ethers.js ^6.15.0
- Security: CORS, rate-limit, dotenv

**Deployment**:
- Local: Hardhat node (Chain ID: 31337)
- Testnet: Sepolia (Chain ID: 11155111)
- Artifacts: JSON format with ABI + metadata

### Migration Guide

**From v1.0.0 (ConditionalPayment) to v2.0.0 (ConditionalUPI)**:

1. **No Breaking Changes**: Both systems coexist
2. **New Features Available**: Use ConditionalUPI for multi-condition support
3. **Existing Code Works**: ConditionalPayment remains functional
4. **Gradual Migration**: Migrate at your own pace

**To use ConditionalUPI**:
```javascript
// Old (ConditionalPayment)
const contract = await ConditionalPayment.deploy(payee, amount, condition, { value: amount });

// New (ConditionalUPI)
const contract = await ConditionalUPI.deploy(relayerAddress);
const tx = await contract.createCondition(payee, deadline, metadataURI, { value: amount });
```

### Known Issues

None at this time.

### Future Enhancements

- Frontend components for ConditionalUPI
- Multi-token support (ERC20)
- Batch operations
- Oracle integration for automated triggering
- Enhanced metadata storage (IPFS)
- Monitoring and analytics dashboard

---

## [1.0.0] - Initial Release

### Added

- Basic ConditionalPayment contract
- Hardhat configuration
- Sepolia deployment scripts
- React frontend with Sender/Receiver components
- Flask backend for AI intent parsing
- MetaMask integration

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).
