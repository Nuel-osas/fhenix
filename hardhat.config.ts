import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "cofhe-hardhat-plugin";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [DEPLOYER_KEY],
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: [DEPLOYER_KEY],
    },
  },
};

export default config;
