import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("GldToken", function () {
    let owner: any, user1: any, user2: any, user3: any, user4: any;
    //
    const OWNER_MINT = 100_000;
    const USER_LIMIT = 5000;
    const FIRST_TRANSFER = 100;
    const SECOND_TRANSFER = 1000;
    //
    before(async function () {
        [owner, user1, user2, user3, user4] = await hre.ethers.getSigners();
        const Contract = await hre.ethers.getContractFactory("GldToken");
        this.contract = await Contract.deploy(OWNER_MINT);
        // mint for users
        await this.contract.mint(user1.address, USER_LIMIT);
        await this.contract.mint(user2.address, USER_LIMIT);
        await this.contract.mint(user3.address, USER_LIMIT);
        await this.contract.mint(user4.address, USER_LIMIT);
        //
        console.log("owner:", owner.address);
        console.log("deployed contract address:", await this.contract.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the correct limit amount", async function () {
            expect(await this.contract.limit()).to.equal(OWNER_MINT);
        });
        it("Should set the correct totalSupply", async function () {
            expect(await this.contract.totalSupply()).to.equal(OWNER_MINT + USER_LIMIT * 4);
        });
        it("Should set the correct owner", async function () {
            expect(await this.contract.owner()).to.equal(owner);
        });
        it("Should mint success for owner", async function () {
            expect(await this.contract.balanceOf(owner.address)).to.be.equal(OWNER_MINT);
        });
        it("Should mint success for users", async function () {
            expect(await this.contract.balanceOf(user1.address)).to.be.equal(USER_LIMIT);
            expect(await this.contract.balanceOf(user2.address)).to.be.equal(USER_LIMIT);
            expect(await this.contract.balanceOf(user3.address)).to.be.equal(USER_LIMIT);
            expect(await this.contract.balanceOf(user4.address)).to.be.equal(USER_LIMIT);
        });
    });

    describe("Transfer", function () {
        it("user2 transfer 100 GLD to user3", async function () {
            // user2 to user3
            await expect(this.contract.connect(user2).transfer(user3.address, FIRST_TRANSFER))
                .to.emit(this.contract, "Transfer")
                .withArgs(user2.address, user3.address, FIRST_TRANSFER);
            expect(await this.contract.balanceOf(user3.address)).to.be.equal(USER_LIMIT + FIRST_TRANSFER);
        });
        it("user3 approve user1 on spending 1000 GLD", async function () {
            const balance0 = await this.contract.balanceOf(user3.address);
            await expect(this.contract.connect(user3).approve(user1.address, SECOND_TRANSFER))
                .to.emit(this.contract, "Approval")
                .withArgs(user3.address, user1.address, SECOND_TRANSFER);
            expect(await this.contract.allowance(user3.address, user1.address)).to.be.equal(SECOND_TRANSFER);
            // just approve, have not spent yet.
            expect(await this.contract.balanceOf(user3.address)).to.be.equal(balance0);
        });
        it("user1 move allownce to user1", async function () {
            const balance0 = await this.contract.balanceOf(user3.address);
            const balance1 = await this.contract.balanceOf(user1.address);
            // too larger
            await expect(this.contract.connect(user1).transferFrom(user3.address, user1.address, 2000))
                    .to.be.revertedWithCustomError(this.contract, "ERC20InsufficientAllowance")
            // correct allowance
            await expect(this.contract.connect(user1).transferFrom(user3.address, user1.address, SECOND_TRANSFER))
                .not.to.be.reverted;
            // verify balance of user3, user1
            expect(await this.contract.balanceOf(user3.address), "user3 balance should be deducted").to.be.equal(balance0 - BigInt(SECOND_TRANSFER));
            expect(await this.contract.balanceOf(user1.address), "user1 balance should be increase").to.be.equal(balance1 + BigInt(SECOND_TRANSFER));
        });
        it("verfiy final balance", async function () {
            expect(await this.contract.balanceOf(user1.address)).to.be.equal(USER_LIMIT + SECOND_TRANSFER)
            expect(await this.contract.balanceOf(user2.address)).to.be.equal(USER_LIMIT - FIRST_TRANSFER)
            expect(await this.contract.balanceOf(user3.address)).to.be.equal(USER_LIMIT + FIRST_TRANSFER - SECOND_TRANSFER)
            expect(await this.contract.balanceOf(user4.address)).to.be.equal(USER_LIMIT)
        })
    });

})