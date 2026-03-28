const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy VeilUSDC
  const VeilUSDC = await hre.ethers.getContractFactory("VeilUSDC");
  const usdc = await VeilUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("VeilUSDC deployed to:", usdcAddress);

  // 2. Deploy VeilDataMarket (pool = deployer)
  const VeilDataMarket = await hre.ethers.getContractFactory("VeilDataMarket");
  const market = await VeilDataMarket.deploy(usdcAddress, deployer.address);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("VeilDataMarket deployed to:", marketAddress);

  console.log("\n=== ENV VARS ===");
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
