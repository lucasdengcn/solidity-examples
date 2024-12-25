import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import AppleContractProxyModule from "./AppleContractProxyModule";

const AppleContractUpgradeModule = buildModule("AppleContractUpgradeModule", (m) => {    
    // gt the deployer, owner  
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);          
    //
    const {proxy, contract} = m.useModule(AppleContractProxyModule); 
    // new version of contract instance
    const contractV2 = m.contract("AppleContractV2", [], { from: deployer });
    // an additional function to call after upgrade.
    const encodedFunctionCall = m.encodeFunctionCall(contractV2, "initializeV2", [owner]);
    //
    m.call(contract, "upgradeToAndCall", [contractV2, encodedFunctionCall], {
        from: owner
    });
    //
    return { proxy };            
});

const AppleContractV2Module = buildModule("AppleContractV2Module", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy } = m.useModule(AppleContractUpgradeModule);
    // get contract instance (proxy)
    const contractV2 = m.contractAt("AppleContractV2", proxy);
    // return for tests, scripts
    return { contractV2 };
});

export default AppleContractV2Module;