import { expect } from "chai";
import { ignition, ethers } from "hardhat";

import CoingeckoOracleModule from "../ignition/modules/CoingeckoOracleModule";

describe("CoingeckoOracleModule", function () {
    let contractV1: any;
    //
    before(async function () {
        //
        const {contract} = await ignition.deploy(CoingeckoOracleModule);
        contractV1 = contract;
        //
        //console.log("proxy: ", proxy);
        //console.log("contract: ", contract);
    });

    it("Should be interactable via proxy", async function () {
        await contractV1.updatePrice(20);
        //
        expect(await contractV1.price()).to.equal(20);
    });

    it("Should be able to retrieve price", async function () {
        const price = await contractV1.price();
        console.log("price: ", price);
    });

})