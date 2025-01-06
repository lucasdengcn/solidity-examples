import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import { ethers } from "ethers";



// https://hardhat.org/ignition/docs/guides/create2

const GldTokenViaCreate2Module = buildModule("GldTokenViaCreate2Module", (m) => {
    const deployer = m.getAccount(0);
    //
    const contract = m.contract("GldToken", [ethers.parseEther("1000")], { from: deployer });
    return { contract };
});

export default GldTokenViaCreate2Module;