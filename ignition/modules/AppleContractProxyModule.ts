import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AppleContractProxyModule = buildModule("AppleContractProxyModule", (m) => {
    // gt the deployer, owner
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);
    // implementation contract
    const implementation = m.contract("AppleContract", [], { from: deployer });
    // deploy Proxy Contract with implmentation
    // call initialize after deploy proxy and implementation.
    const initialize = m.encodeFunctionCall(implementation, "initialize", [owner])
    const proxy = m.contract("ERC1967Proxy", [implementation, initialize]);
    //
    return { proxy };
});

const AppleContractModule = buildModule("AppleContractModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy } = m.useModule(AppleContractProxyModule);
    // get contract instance (proxy)
    const contract = m.contractAt("AppleContract", proxy);
    return { contract, proxy };
});

export default AppleContractModule;