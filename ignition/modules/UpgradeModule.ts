import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import proxyModule from "./ProxyModule";

const upgradeModule = buildModule("UpgradeModule", (m) => {
    const proxyAdminOwner = m.getAccount(0);
    //
    const { proxyAdmin, proxy } = m.useModule(proxyModule);
    // new version of contract instance
    const demoTokenV2 = m.contract("DemoTokenV2");
    // an additional function to call after upgrade.
    const encodedFunctionCall = m.encodeFunctionCall(demoTokenV2, "setName", ["Example Name"]);
    //
    m.call(proxyAdmin, "upgradeAndCall", [proxy, demoTokenV2, encodedFunctionCall], {
        from: proxyAdminOwner
    });
    //
    return { proxyAdmin, proxy };
});

const demoTokenV2Module = buildModule("DemoTokenV2Module", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy } = m.useModule(upgradeModule);
    // get DemoTokenV2 contract instance (proxy)
    const demoTokenV2 = m.contractAt("DemoTokenV2", proxy);
    // return for tests, scripts
    return { demoTokenV2 };
});

export default demoTokenV2Module;