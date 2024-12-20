import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("ContractA", function () {

    async function loadFixtureContracts() {
        const amount = 100;
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const ContractA = await hre.ethers.getContractFactory("ContractA");
        const contractA = await ContractA.deploy(amount);
        //
        return { contractA, amount, owner, otherAccount }
    };

    describe("Deployment", function () {
        it("Should set the right limit amount", async function () {
            const { contractA, amount } = await loadFixture(loadFixtureContracts);
            expect(await contractA.limit()).to.equal(amount);
        });
        it("Should set the right owner", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            expect(await contractA.owner()).to.equal(owner);
        });
    });

    describe("CheckAmount", function () {
        it("Should be failed given larger amount", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            expect(await contractA.isAmountInRange(110)).to.equal(false);
        });
        it("Should be success given smaller amount", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            expect(await contractA.isAmountInRange(80)).to.equal(true);
        });
    });

    describe("Deposit", function () {
        it("Should be failed and total no update given larger amount", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            const total = await contractA.total();
            await expect(contractA.deposit(110)).to.be.revertedWithCustomError(contractA, "AmountOutOfRangeErr");
            // total has not changed
            expect(await contractA.total()).to.be.equal(total);
        });
        it("Should be failed and total no update given other account", async function () {
            const { contractA, otherAccount } = await loadFixture(loadFixtureContracts);
            const total = await contractA.total();
            await expect(contractA.connect(otherAccount).deposit(110)).to.be.revertedWithCustomError(contractA, "UnauthorizedErr");
            expect(await contractA.total()).to.be.equal(total);
        });
        it("Should be failed and total on update given locked", async function () {
            const { contractA, otherAccount } = await loadFixture(loadFixtureContracts);
            const total = await contractA.total();
            await contractA.forceLock();
            await expect(contractA.deposit(80)).to.be.revertedWithCustomError(contractA, "ReentranceErr");
            expect(await contractA.total()).to.be.equal(total);
        });
        it("Should be success given smaller amount", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            await expect(contractA.deposit(80)).to.emit(contractA, "AmountDeposited").withArgs(80);
        });
    });

    describe("Total", function () {
        it("Should update total correct when deposit success", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            const amount = 80;
            const total = await contractA.total();
            await expect(contractA.deposit(amount)).not.to.be.reverted;
            const total2 = await contractA.total();
            expect(total2).to.equal(total + BigInt(amount));
        });

        it("Should not update total when deposit failed", async function () {
            const { contractA, owner } = await loadFixture(loadFixtureContracts);
            const amount = 180;
            const total = await contractA.total();
            await expect(contractA.deposit(amount)).to.be.reverted;
            const total2 = await contractA.total();
            expect(total2).to.equal(total);
        });

    });

});