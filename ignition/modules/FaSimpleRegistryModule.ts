import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FaSimpleRegistryModule = buildModule("FaSimpleRegistryModule", (m) => {

  const contract = m.contract("FaSimpleRegistry", []);

  return { contract };
});

export default FaSimpleRegistryModule;