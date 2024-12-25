import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("ArrayExample", function () {

    async function loadFixtureContracts() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user1, user2] = await hre.ethers.getSigners();
        const Contract = await hre.ethers.getContractFactory("ArrayExample");
        const contract = await Contract.deploy();
        //
        return { contract, owner, user1, user2 }
    };

    describe("Array", function () {
        it("Init array success", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            expect(await contract.length()).to.be.equal(0);
        });
        it("Should be panic given empty array when get element", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            await expect(contract.head()).to.be.revertedWithPanic(0x32);
        });
        it("Should be panic given empty array when pop", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            await expect(contract.pop()).to.be.revertedWithPanic(0x31);
        });
        it("Should push success, length will increase by 1", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            const len0 = await contract.length();
            await contract.push(1);
            expect(await contract.length()).to.be.equal(len0 +  BigInt(1));
        });
        it("Should pop success, length will decrease by 1", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            await contract.push(1);
            await contract.push(2);
            const len0 = await contract.length();
            await contract.pop();
            expect(await contract.length()).to.be.equal(len0 -  BigInt(1));
        });
        it("Should remove success, length will be the same", async function () {
            const { contract, user1 } = await loadFixture(loadFixtureContracts);
            await contract.push(1);
            await contract.push(2);
            const len0 = await contract.length();
            await contract.removeAt(1)
            expect(await contract.length()).to.be.equal(len0);
        });
    });

});