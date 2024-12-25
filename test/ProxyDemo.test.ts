import { expect } from "chai";
import { ignition, ethers } from "hardhat";

import ProxModule from "../ignition/modules/ProxyModule";
import UpgradeModule from "../ignition/modules/UpgradeModule";
import { ZeroAddress } from "ethers";

describe("DemoToken Proxy", function () {

    describe("Proxy interaction", async function () {
        it("Should be interactable via proxy", async function () {
            const [, otherAccount] = await ethers.getSigners();
            const { demoToken } = await ignition.deploy(ProxModule);
            expect(await demoToken.connect(otherAccount).version()).to.equal("1.0.0");
            //
        });
        it("Contract Consturctor will not be called", async function () {
            const { demoToken } = await ignition.deploy(ProxModule);
            expect(await demoToken.owner(), "means owner can not set from contructor").to.equal(ZeroAddress);
            //
        });
    });

    describe("Upgrading", async function () {
        it("Should be upgrade the proxy to DemoTokenV2", async function () {
            const [, otherAccount] = await ethers.getSigners();
            const { demoTokenV2 } = await ignition.deploy(UpgradeModule);
            expect(await demoTokenV2.connect(otherAccount).version()).to.equal("2.0.0");
        });
        it("Contract Consturctor will not be called", async function () {
            const { demoTokenV2 } = await ignition.deploy(UpgradeModule);
            expect(await demoTokenV2.owner(), "means owner can not set from contructor").to.equal(ZeroAddress);
            //
        });
        it("should have set the name during upgrade", async function () {
            const [, otherAccount] = await ethers.getSigners();
            const { demoTokenV2 } = await ignition.deploy(UpgradeModule);
            expect(await demoTokenV2.connect(otherAccount).name()).to.equal("Example Name");
            expect(await demoTokenV2.owner()).to.equal(ZeroAddress);
        })
    })

});