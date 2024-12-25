import * as dotenv from "dotenv";
dotenv.config();

import "@nomicfoundation/hardhat-ethers";
import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-solhint";

import 'hardhat-abi-exporter';
import "hardhat-tracer";

import { HardhatUserConfig, task, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";

// const ETHERSCAN_API_KEY =  vars.get("ETHERSCAN_API_KEY")
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || vars.get("ETHERSCAN_API_KEY")
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || vars.get("ACCOUNT_PRIVATE_KEY")
const INFURA_API_KEY = process.env.INFURA_API_KEY || vars.get("INFURA_API_KEY")

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  // gasReporter: {
  //   // trackGasDeltas: process.env.GAS_GOLF === "true",
  //   // currencyDisplayPrecision: 8,
  //   // showMethodSig: true
  // }
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
