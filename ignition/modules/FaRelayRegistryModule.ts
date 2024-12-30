import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FaRelayRegistryModule = buildModule("FaRelayRegistryModule", (m) => {

  const forwarder = m.contract("ERC2771Forwarder", ["ERC2771Forwarder"]);
  const contract = m.contract("FaRelayRegistry", [forwarder]);

  return { contract, forwarder };
});

export default FaRelayRegistryModule;