import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const Create2DeployerModule = buildModule("Create2DeployerModule", (m) => {
    const deployer = m.getAccount(0);
    const create2Deployer = m.contract("Create2Example", [], { from: deployer });
    return { create2Deployer };
});

export default Create2DeployerModule;