// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ContractAModule = buildModule("ContractAModule", (m) => {

  const lock = m.contract("ContractA", [50]);

  return { lock };
});

export default ContractAModule;
