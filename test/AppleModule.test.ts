import { expect } from "chai";
import { ignition, ethers } from "hardhat";

import AppleContractProxyModule from "../ignition/modules/AppleContractProxyModule";
import AppleContractUpgradeModule from "../ignition/modules/AppleContractUpgradeModule";

describe("AppleModule", function () {
    let contractV1: any;
    let proxy0: any;
    //
    before(async function () {
        //
        const {contract, proxy} = await ignition.deploy(AppleContractProxyModule);
        contractV1 = contract;
        proxy0 = proxy;
        //
        //console.log("proxy: ", proxy);
        //console.log("contract: ", contract);
    });

    it("Should be interactable via proxy", async function () {
        expect(await proxy0.getAddress()).equal(await contractV1.getAddress());
        expect(await contractV1.version()).to.equal("1.0.0");
        expect(await contractV1.price0()).to.equal(10);
        await contractV1.changePrice(20);
        //
        expect(await contractV1.price0()).to.equal(20);
    });

    it("Should upgrade successfully", async function () {
        const {contractV2} = await ignition.deploy(AppleContractUpgradeModule);
        //
        // console.log("contractV2: ", await contractV2.getAddress());
        // console.log("proxy: ", await proxy.getAddress());
        //
        expect(await contractV2.version()).to.equal("2.0.0");
        expect(await contractV2.price1()).to.equal(20);
        // this assertion tells that contractV2 point to implementation address
        expect(await contractV2.price0()).to.equal(10);
        //
        expect(await contractV2.getAddress()).not.to.equal(await contractV1.getAddress());
        //
        // expect(await contractV1.version()).to.equal("2.0.0");
    });

})