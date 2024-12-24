import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("ProxyModule", (m) => {
    // gt the owner of ProxyAdmin contract for upgrading
    const proxyAdminOwner = m.getAccount(0);
    // implementation contract
    const demoToken = m.contract("DemoToken");
    // deploy Proxy Contract with implmentation
    const proxy = m.contract("TransparentUpgradeableProxy", [demoToken, proxyAdminOwner, "0x"]);
    const proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");
    // get the ProxyAdmin contract instance
    const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);
    //
    return { proxyAdmin, proxy };
});

const demoModule = buildModule("DemoModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy, proxyAdmin } = m.useModule(proxyModule);
    // get DemoToken contract instance (proxy)
    const demoToken = m.contractAt("DemoToken", proxy);
    return { demoToken, proxy, proxyAdmin };
});

export default demoModule;