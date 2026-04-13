import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: {
    profiles: {
      default: {
        version: "0.8.33",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },
  networks: {
    wirefluidTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.WIREFLUID_RPC_URL || "https://evm.wirefluid.com",
      chainId: 92533,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    enabled: true,
    apiKey: {
      wirefluidTestnet: "not-needed",
    },
    customChains: [
      {
        network: "wirefluidTestnet",
        chainId: 92533,
        urls: {
          apiURL: "https://wirefluidscan.com/api",
          browserURL: "https://wirefluidscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
});
