import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import YYTokenProxyModule from "./YYTokenProxyModule";

const yyTokenUpgradeModule = buildModule("YYTokenUpgradeModule", (m) => {    
    // gt the owner of ProxyAdmin contract for upgrading    
    const proxyAdminOwner = m.getAccount(0);            
    // proxy, proxyAdmin;
    const {proxy, proxyAdmin} = m.useModule(YYTokenProxyModule); 
    // new version of contract instance
    const yyTokenV2 = m.contract("YYTokenContractV2");
    // an additional function to call after upgrade.
    const encodedFunctionCall = m.encodeFunctionCall(yyTokenV2, "upgratePostEvent");
    //
    m.call(proxyAdmin, "upgradeAndCall", [proxy, yyTokenV2, encodedFunctionCall], {
        from: proxyAdminOwner
    });
    //
    return { proxyAdmin, proxy };            
});

const yyTokenNewModule = buildModule("YYTokenNewModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy } = m.useModule(yyTokenUpgradeModule);
    // get contract instance (proxy)
    const yyTokenNew = m.contractAt("YYTokenContractV2", proxy);
    // return for tests, scripts
    return { yyTokenNew };
});

export default yyTokenNewModule;