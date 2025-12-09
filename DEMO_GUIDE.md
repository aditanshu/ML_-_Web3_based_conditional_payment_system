# ConditionalUPI Smart Contract System - Demo Guide

Complete walkthrough for deploying and testing the ConditionalUPI conditional payment system.

## Prerequisites

- **Node.js** v18+ installed
- **MetaMask** browser extension
- **Git** (optional, for cloning)
- Test ETH for Sepolia testnet (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## Project Structure

```
├── contracts/
│   ├── ConditionalPayment.sol    # Original contract (preserved)
│   └── ConditionalUPI.sol         # New multi-condition contract
├── test/
│   ├── ConditionalPayment.test.js
│   └── ConditionalUPI.test.js
├── scripts/
│   ├── deploy.cjs                 # Original deploy script
│   ├── deploy_sepolia.cjs         # Original Sepolia deploy
│   └── deployUPI.cjs              # New ConditionalUPI deploy
├── deployments/
│   ├── localhost.json             # Local deployment artifact
│   └── sepolia.json               # Sepolia deployment artifact
├── relayer/                       # Node.js relayer service
│   ├── server.js
│   ├── relayer.js
│   └── package.json
├── backend/                       # Flask AI backend (preserved)
│   └── app.py
└── frontend/                      # React frontend
    └── src/

```

## Installation

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Install Relayer Dependencies

```bash
cd relayer
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Configuration

### Root .env File

Create `.env` in project root:

```env
# Deployer private key (for testnet deployment)
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# Existing Flask backend
GROQ_API_KEY=your_groq_api_key
```

### Relayer .env File

Create `relayer/.env`:

```env
# For local development
NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PORT=3001
API_KEY=demo_api_key_12345
```

## Local Development Workflow

### Terminal 1: Start Hardhat Node

```bash
npm run node
```

**Output**: Local blockchain running on `http://127.0.0.1:8545` with 20 test accounts.

### Terminal 2: Deploy ConditionalUPI Contract

```bash
npm run deploy:local
```

**Output**:
```
✅ ConditionalUPI deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
💾 Deployment artifact saved to: deployments/localhost.json
```

**Note**: The contract address and deployment artifact are automatically saved.

### Terminal 3: Start Relayer Service

```bash
cd relayer
npm start
```

**Output**:
```
✅ Relayer wallet initialized: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ Contract loaded: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🚀 Relayer server running on port 3001
```

### Terminal 4: Start Flask Backend (Optional - for AI parsing)

```bash
cd backend
python app.py
```

### Terminal 5: Start Frontend

```bash
cd frontend
npm run dev
```

**Output**: Frontend running on `http://localhost:5173`

## Testing the System

### Run Unit Tests

```bash
npm test
```

**Expected**: All 46 tests pass
- 13 tests for ConditionalPayment (existing contract)
- 33 tests for ConditionalUPI (new contract)

### Test with Gas Reporting

```bash
npm run test:gas
```

## Demo Scenarios

### Scenario A: Create and Trigger Condition (Happy Path)

**Step 1**: Create a condition via contract interaction

Using Hardhat console or frontend:

```javascript
// Get signers
const [payer, payee, relayer] = await ethers.getSigners();

// Load contract
const ConditionalUPI = await ethers.getContractAt(
  "ConditionalUPI",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
);

// Create condition (1 day deadline)
const deadline = Math.floor(Date.now() / 1000) + 86400;
const tx = await ConditionalUPI.connect(payer).createCondition(
  payee.address,
  deadline,
  "ipfs://QmTest123",
  { value: ethers.parseEther("1.0") }
);

await tx.wait();
console.log("✅ Condition created with ID: 0");
```

**Step 2**: Trigger condition via relayer API

```bash
curl -X POST http://localhost:3001/api/conditions/0/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "proof": "task_completed_proof_12345",
    "apiKey": "demo_api_key_12345"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "conditionId": "0",
  "txHash": "0x...",
  "blockNumber": 3,
  "message": "Condition triggered successfully"
}
```

**Step 3**: Verify condition status

```bash
curl http://localhost:3001/api/conditions/0
```

**Expected Response**:
```json
{
  "id": "0",
  "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "amount": "1.0",
  "executed": true,
  "refunded": false,
  "status": "executed"
}
```

### Scenario B: Create and Refund After Deadline

**Step 1**: Create condition with short deadline

```javascript
// 10 seconds deadline for testing
const deadline = Math.floor(Date.now() / 1000) + 10;
const tx = await ConditionalUPI.connect(payer).createCondition(
  payee.address,
  deadline,
  "",
  { value: ethers.parseEther("0.5") }
);
```

**Step 2**: Wait for deadline to pass

```bash
# Wait 15 seconds
sleep 15
```

**Step 3**: Refund condition

```javascript
const refundTx = await ConditionalUPI.connect(payer).refundCondition(1);
await refundTx.wait();
console.log("✅ Condition refunded");
```

**Step 4**: Verify refund

```bash
curl http://localhost:3001/api/conditions/1
```

**Expected**: `"refunded": true, "status": "refunded"`

### Scenario C: Test Existing ConditionalPayment (Preserved Functionality)

The original ConditionalPayment contract still works:

```bash
# Use existing deployment scripts
npx hardhat run scripts/deploy.cjs --network localhost
```

Frontend Sender/Receiver tabs continue to work with the original contract.

## Testnet Deployment (Sepolia)

### 1. Get Testnet ETH

- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Wait for ETH to arrive

### 2. Configure Environment

Update root `.env`:
```env
PRIVATE_KEY=your_actual_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 3. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**Output**:
```
✅ ConditionalUPI deployed to: 0x...
💾 Deployment artifact saved to: deployments/sepolia.json
🔍 View on Etherscan: https://sepolia.etherscan.io/address/0x...
```

### 4. Configure Relayer for Sepolia

Update `relayer/.env`:
```env
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
RELAYER_PRIVATE_KEY=your_relayer_private_key
```

### 5. Start Relayer

```bash
cd relayer
npm start
```

### 6. Test on Sepolia

Create condition via MetaMask and trigger via relayer API (same as local).

## Validation Steps

### Check Contract Deployment

```bash
# View deployment artifact
cat deployments/localhost.json | jq '.address'
```

### Check Relayer Health

```bash
curl http://localhost:3001/health
```

**Expected**:
```json
{
  "status": "healthy",
  "network": "localhost",
  "relayerBalance": "10000.0 ETH",
  "totalConditions": 0
}
```

### Check Contract Events

In Hardhat node terminal, you'll see events:
```
ConditionCreated(id=0, payer=0x..., payee=0x..., amount=1000000000000000000)
ConditionTriggered(id=0, triggeredBy=0x..., proofHash=0x...)
```

### Check Balances

```javascript
// Check payee received funds
const balance = await ethers.provider.getBalance(payee.address);
console.log("Payee balance:", ethers.formatEther(balance));
```

## Troubleshooting

### Issue: Tests Failing

**Solution**: Ensure you removed `"type": "module"` from root `package.json`. Hardhat requires CommonJS.

### Issue: Relayer Can't Connect to Contract

**Solution**: 
1. Check `deployments/localhost.json` exists
2. Verify `NETWORK` in `relayer/.env` matches deployment
3. Ensure Hardhat node is running

### Issue: Insufficient Funds Error

**Solution**:
1. For local: Use Hardhat test accounts (have 10000 ETH each)
2. For testnet: Get more ETH from faucet
3. Check relayer balance: `curl http://localhost:3001/health`

### Issue: Nonce Too Low

**Solution**: Restart Hardhat node and redeploy. Nonce issues occur when blockchain state is reset.

### Issue: Frontend Can't Find Contract

**Solution**: 
1. Check `frontend/src/contracts/ConditionalUPI.json` exists
2. Verify it contains correct `address` and `abi`
3. Deployment script auto-copies to frontend folder

### Issue: API Key Invalid

**Solution**: Ensure `apiKey` in trigger request matches `API_KEY` in `relayer/.env`

## Network Information

### Local Hardhat

- **RPC**: `http://127.0.0.1:8545`
- **Chain ID**: 31337
- **Block Explorer**: N/A (local only)

### Sepolia Testnet

- **RPC**: `https://sepolia.infura.io/v3/YOUR_KEY`
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

## API Reference

### Relayer Endpoints

#### GET /health
Check relayer status and balance.

**Response**:
```json
{
  "status": "healthy",
  "network": "localhost",
  "relayerBalance": "10000.0 ETH",
  "totalConditions": 5
}
```

#### POST /api/conditions
Store condition metadata (optional).

**Request**:
```json
{
  "conditionId": 0,
  "metadata": { "description": "Payment for service" }
}
```

#### GET /api/conditions/:id
Get condition status from contract.

**Response**:
```json
{
  "id": "0",
  "payer": "0x...",
  "payee": "0x...",
  "amount": "1.0",
  "deadline": 1234567890,
  "executed": false,
  "refunded": false,
  "canTrigger": true,
  "canRefund": false,
  "status": "active"
}
```

#### POST /api/conditions/:id/trigger
Trigger condition via relayer.

**Request**:
```json
{
  "proof": "evidence_of_completion",
  "apiKey": "demo_api_key_12345"
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 5,
  "gasUsed": "50000"
}
```

## Security Notes

- ✅ Never commit `.env` files
- ✅ Use separate relayer wallet with limited funds
- ✅ Rotate API keys regularly
- ✅ Enable rate limiting in production
- ✅ Use HTTPS for production relayer
- ✅ Audit smart contracts before mainnet deployment

## Next Steps

1. **Frontend Integration**: Connect React UI to ConditionalUPI contract
2. **Enhanced Metadata**: Store rich condition metadata (IPFS, etc.)
3. **Oracle Integration**: Add Chainlink or custom oracle for automated triggering
4. **Multi-token Support**: Extend contract to support ERC20 tokens
5. **Batch Operations**: Add batch create/trigger functions
6. **Monitoring**: Add logging and monitoring for relayer
7. **Production Deployment**: Deploy to mainnet with proper security audit

## Support

For issues or questions:
- Check Hardhat documentation: https://hardhat.org/docs
- Check ethers.js documentation: https://docs.ethers.org/v6/
- Review test files for usage examples

---

**Version**: 2.0.0  
**Last Updated**: 2025-12-09  
**License**: MIT
