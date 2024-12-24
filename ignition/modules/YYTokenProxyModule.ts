import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("YYTokenProxyModule", (m) => {
    // gt the owner of ProxyAdmin contract for upgrading
    const proxyAdminOwner = m.getAccount(0);
    // implementation contract
    const yyToken = m.contract("YYTokenContractV1");
    // deploy Proxy Contract with implmentation
    // call initialize after deploy proxy and implementation.
    const data = m.encodeFunctionCall(yyToken, "initialize", [proxyAdminOwner])
    //
    const proxy = m.contract("TransparentUpgradeableProxy", [yyToken, proxyAdminOwner, data]);
    const proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");
    // get the ProxyAdmin contract instance
    const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);
    //
    return { proxyAdmin, proxy };
});

const yyTokenModule = buildModule("YYTokenModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { proxy, proxyAdmin } = m.useModule(proxyModule);
    // get DemoToken contract instance (proxy)
    const yyToken = m.contractAt("YYTokenContractV1", proxy);
    return { yyToken, proxy, proxyAdmin };
});

export default yyTokenModule;