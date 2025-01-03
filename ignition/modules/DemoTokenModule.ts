import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DemoTokenModule = buildModule("DemoTokenModule", (m) => {
    const contract = m.contract("DemoToken", [], {});
    return { contract };
});

export default DemoTokenModule;
