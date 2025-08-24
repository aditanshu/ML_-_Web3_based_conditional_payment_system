const hre = require("hardhat");

async function main() {
  const oneYear = 365 * 24 * 60 * 60;
  const unlockTime = Math.floor(Date.now() / 1000) + oneYear;

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: hre.ethers.parseEther("0.01") });
  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${await lock.getAddress()}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
