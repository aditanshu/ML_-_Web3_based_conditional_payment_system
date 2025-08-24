# Web3-Based Conditional Payment System (Smart Conditional UPI)

AI-powered Web3 UPI system with conditional payments.

## Structure
- **backend/** → Flask backend (AI + relayer)
- **contracts/** → Solidity contracts
- **frontend/** → React + Vite + Tailwind frontend
- **scripts/** → Hardhat deploy scripts
- **test/** → Contract tests
- **deployments/** → ABI + addresses
- **docs/** → Pitch, demo guide

## Quickstart
1) Node >= 22.10, Python 3.11+, npm
2) Install deps:
   ```bash
   npm install        # at project root (Hardhat)
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
