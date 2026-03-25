const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  const poolAddress = deployer.address;

  const VeilDataMarket = await hre.ethers.getContractFactory("VeilDataMarket");
  const contract = await VeilDataMarket.deploy(poolAddress);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("VeilDataMarket deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
