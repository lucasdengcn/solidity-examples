import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("ContractC", function () {

    async function loadFixtureContracts() {
        const amount = 50;
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const ContractC = await hre.ethers.getContractFactory("ContractC");
        const contractC = await ContractC.deploy(amount);
        //
        const ContractA = await hre.ethers.getContractFactory("ContractA");
        const contractA = await ContractA.deploy(100);
        //
        const address = await contractA.getAddress();
        await contractC.updateContractAddress(address);
        //
        return { contractC, amount, owner, otherAccount, contractA }
    };

    describe("Deployment", function () {
        it("Should set the right limit amount", async function () {
            const { contractC, amount } = await loadFixture(loadFixtureContracts);
            expect(await contractC.limit()).to.equal(amount);
        });
        it("Should set the right owner", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.owner()).to.equal(owner);
            expect(await contractA.owner()).to.equal(owner);
        });
    });

    describe("Address", function () {
        it("Should set the correct A address", async function () {
            const { contractC, contractA } = await loadFixture(loadFixtureContracts);
            const address = await contractA.getAddress();
            //
            await expect(contractC.updateContractAddress(address))
                .to.emit(contractC, "TargetContractAddressUpdated")
                .withArgs(address)
        });
        it("Should not change A address given other account", async function () {
            const { contractC, contractA, otherAccount } = await loadFixture(loadFixtureContracts);
            const address = await contractA.getAddress();
            //
            await expect(contractC.connect(otherAccount).updateContractAddress(address))
                .to.be.revertedWithCustomError(contractC, "UnauthorizedErr");
        });
    });

    describe("Amount", function () {
        it("Amount will be invalid given 150 > 50", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.checkAmountCall(150))
                .to.be.false;
            expect(await contractC.limit(), "limit Should not change").to.be.equal(50);
        });
        it("Amount will be invalid given 40 < 50", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.checkAmountCall(40))
                .to.be.true;
            expect(await contractC.limit(), "limit Should not change").to.be.equal(50);
        });
    });

    describe("SendEther", function () {
        it("sendCall will be success given valid ether amount", async function () {
            const amountToSend = hre.ethers.parseEther("1")
            const { contractC, owner, contractA, otherAccount } = await loadFixture(loadFixtureContracts);
            // must call with {value: amount}
            await expect(contractC.connect(otherAccount).sendReceipientCall(contractA.getAddress(), 1, {value: amountToSend}))
                .to.emit(contractC, "SendSuccessEvent")
            expect(await contractA.getBalance()).to.be.equal(amountToSend);
        });
        it("sendCall will be success given valid ether amount", async function () {
            const amountToSend = hre.ethers.parseEther("1")
            const { contractC, owner, contractA, otherAccount } = await loadFixture(loadFixtureContracts);
            // must call with {value: amount}
            await expect(contractC.connect(otherAccount).sendCall(1, {value: amountToSend}))
                    .to.emit(contractC, "SendSuccessEvent");
            expect(await contractA.getBalance()).to.be.equal(amountToSend);
        });
        it("TransferAmount will be success given valid ether amount", async function () {
            const amountToSend = hre.ethers.parseEther("1")
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            await expect(contractC.transferAmount(1, {value: amountToSend}))
                    .to.emit(contractC, "SendSuccessEvent");
            expect(await contractA.getBalance()).to.be.equal(amountToSend);
        });
        it("sendAmount will be success given valid ether amount", async function () {
            const amountToSend = hre.ethers.parseEther("1")
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            // must call with {value: amount}
            await expect(contractC.sendAmount(1, {value: amountToSend}))
                    .to.emit(contractC, "SendSuccessEvent");
            expect(await contractA.getBalance()).to.be.equal(amountToSend);
        });
    });

    describe("DepoistCall", function () {
        it("DepoistCall will be failed given sender is different from owner", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            await expect(contractC.depositCall(150))
                .to.be.revertedWithCustomError(contractC, "UnauthorizedErr");
            expect(await contractC.limit(), "limit Should not change").to.be.equal(50);
        });
    });

    // state variables match on position.
    describe("DepoistDelegateCall", function () {
        it("DepoistDelegateCall with larger amount will be failed, given 150 > 50", async function () {
            const { contractC, contractA } = await loadFixture(loadFixtureContracts);
            await expect(contractC.depositDelegate(150)).to.be.revertedWithCustomError(contractC, "AmountOutOfRangeErr");
            expect(await contractC.limit(), "limit Should not change").to.be.equal(50);
            expect(await contractC.total(), "total should be zero").to.be.equal(0);
        });
        it("DepoistDelegateCall with amount(60) will be too much, given 60 > 50", async function () {
            const { contractC, contractA } = await loadFixture(loadFixtureContracts);
            await expect(contractC.depositDelegate(60)).to.be.revertedWithCustomError(contractC, "AmountOutOfRangeErr");
            expect(await contractC.limit(), "limit Should not change").to.be.equal(50);
            expect(await contractC.total(), "total should be zero").to.be.equal(0);
        });
        it("DepoistDelegateCall with amount(40) will be success, given 40 < 50", async function () {
            const { contractC, contractA } = await loadFixture(loadFixtureContracts);
            await expect(contractC.depositDelegate(40)).to.emit(contractC, "DepositCallSuccessEvent");
            expect(await contractC.limit(), "C limit Should not change").to.be.equal(50);
            expect(await contractC.total()).to.be.equal(40);
            expect(await contractA.total(), "A total should be zero").to.be.equal(0);
        });
    });

    // error handling
    describe("ErrorHandling", function () {
        it("Should be true when amount < 100", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.tryCatchExternalCall(80))
                .to.be.equal(0);
        });

        it("Should be error1 when 100 < amount < 200", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.tryCatchExternalCall(120))
                .to.be.equal(1);
        });

        it("Should be error2 when 200 < amount < 300", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.tryCatchExternalCall(220))
                .to.be.equal(2);
        });

        it("Should be error3 when 300 < amount < 400", async function () {
            const { contractC, owner, contractA } = await loadFixture(loadFixtureContracts);
            expect(await contractC.tryCatchExternalCall(320))
                .to.be.equal(3);
        });

    });
});