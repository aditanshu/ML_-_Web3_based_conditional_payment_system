const hre = require("hardhat");

async function main() {
  // Example parameters
  const receiver = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with test address
  const amount = hre.ethers.parseEther("1"); // 1 ETH
  const condition = "Payment after project completion";

  const ConditionalPayment = await hre.ethers.getContractFactory("ConditionalPayment");
  const conditionalPayment = await ConditionalPayment.deploy(receiver, amount, condition, { value: amount });

  await conditionalPayment.waitForDeployment();

  console.log("ConditionalPayment deployed to:", await conditionalPayment.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
