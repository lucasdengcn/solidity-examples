import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Helpers", function () {

    async function loadFixtureContracts() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user1, user2] = await hre.ethers.getSigners();
        const Contract = await hre.ethers.getContractFactory("Helpers");
        const contract = await Contract.deploy();
        //
        return { contract, owner, user1, user2 }
    };

    it("Should generate storage location", async function () {
        const { contract, owner, user1, user2 } = await loadFixtureContracts();
        const resp = await contract.storageLocation("BankApp.storage.TermVault01");
        console.log(resp);
    });

});