// scripts/deploy_and_demo.cjs
const { ethers } = require("hardhat");

async function main() {
  // Use two local signers from Hardhat
  const [payer, payee] = await ethers.getSigners();

  // Demo params
  const amount = ethers.parseEther("0.5");
  const condition = "Payment after project completion";

  // Deploy from payer and fund the contract with `amount`
  const Factory = await ethers.getContractFactory("ConditionalPayment", payer);
  const contract = await Factory.deploy(payee.address, amount, condition, { value: amount });
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ Deployed ConditionalPayment at:", address);
  console.log("   Payer:", payer.address);
  console.log("   Payee:", payee.address);
  console.log("   Amount (ETH):", ethers.formatEther(amount));
  console.log("   Condition:", condition);

  // Read details (uses your custom getter)
  const [p, r, a, c, paid] = await contract.getDetails();
  console.log("\n📄 Details (before):");
  console.log("   payer   :", p);
  console.log("   payee   :", r);
  console.log("   amount  :", ethers.formatEther(a));
  console.log("   condition:", c);
  console.log("   isPaid  :", paid);

  // Release payment (must be called by payer)
  const tx = await contract.connect(payer).releasePayment();
  await tx.wait();

  const after = await contract.getDetails();
  console.log("\n💸 Payment released.");
  console.log("   isPaid (after):", after[4]);

  // (Optional) show payee balance just to prove ETH moved
  const payeeBalance = await ethers.provider.getBalance(payee.address);
  console.log("   Payee balance (ETH):", ethers.formatEther(payeeBalance));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
