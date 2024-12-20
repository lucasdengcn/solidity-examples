import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("EncodingExample", function () {

    async function loadFixtureContracts() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const Contract = await hre.ethers.getContractFactory("EncodingExample");
        const contract = await Contract.deploy();
        //
        return { contract, owner, otherAccount }
    };

    describe("PackCustomError", function () {
        it("Should pack custom error1", async function () {
            const { contract } = await loadFixture(loadFixtureContracts);
            await contract.packCustomError1();
        });
        it("Should pack string", async function () {
            const { contract } = await loadFixture(loadFixtureContracts);
            await contract.packString();
        });
        it("Should pack custom error2", async function () {
            const { contract } = await loadFixture(loadFixtureContracts);
            await contract.packCustomError2();
        });
        it("Should pack args", async function () {
            const { contract } = await loadFixture(loadFixtureContracts);
            await contract.packArgs();
        });
    });

});