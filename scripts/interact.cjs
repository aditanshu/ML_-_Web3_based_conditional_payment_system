const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // your deployed address

  // Load the contract ABI + bytecode
  const ConditionalPayment = await ethers.getContractFactory("ConditionalPayment");
  const contract = ConditionalPayment.attach(contractAddress);

  console.log("Contract loaded at:", contractAddress);

  // Call your custom getter
  const details = await contract.getDetails();
  console.log("Payer:", details[0]);
  console.log("Payee:", details[1]);
  console.log("Amount (wei):", details[2].toString());
  console.log("Condition:", details[3]);
  console.log("Is Paid?:", details[4]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
