import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("SafeTokenApp", function () {
    let owner: any, spender: any, user1: any, user2: any, user3: any;
    //
    const OWNER_MINT = 100000;
    //
    beforeEach(async function () {
        [owner, user1, user2, user3] = await hre.ethers.getSigners();
        //
        const Contract0 = await hre.ethers.getContractFactory("GldToken");
        this.contractToken = await Contract0.deploy(OWNER_MINT);
        await this.contractToken.waitForDeployment();
        //
        const Contract = await hre.ethers.getContractFactory("SafeTokenApp");
        this.contractSpender = await Contract.deploy(await this.contractToken.getAddress());
        await this.contractSpender.waitForDeployment();
        spender = await this.contractSpender.getAddress();
        //
        await this.contractToken.mint(spender, OWNER_MINT);
        //
        // console.log("owner:", owner.address, "spender:", spender);
    });

    describe("SafeERC20", function () {
        it("Should owner having tokens", async function () {
            expect(await this.contractToken.balanceOf(spender)).to.be.equal(OWNER_MINT);
        });
        it("Should transfer contract token success to user1", async function () {
            await expect(this.contractSpender.transfer(user1.address, 100))
                .to.emit(this.contractToken, "Transfer")
                .withArgs(spender, user1.address, 100);
            expect(await this.contractToken.balanceOf(user1.address)).to.be.equal(100);
        });
        it("Should approve allowance success to user1", async function () {
            await this.contractSpender.approve(user1.address, 100);
            expect(await this.contractToken.allowance(spender, user1.address)).to.be.equal(100);
            //
            await this.contractSpender.increaseAllowance(user1.address, 100);
            expect(await this.contractToken.allowance(spender, user1.address)).to.be.equal(200);
            //
            await this.contractSpender.decreaseAllowance(user1.address, 100);
            expect(await this.contractToken.allowance(spender, user1.address)).to.be.equal(100);
        });
        it("Should safeTransferFrom allowance success to user", async function () {
            // allowance (owner --> spender)
            await this.contractToken.connect(owner).approve(spender, 100);
            expect(await this.contractToken.allowance(owner.address, spender)).to.be.equal(100);
            // spending (spender --> to)
            await expect(this.contractSpender.transferFrom(owner.address, user1.address, 50))
                .to.emit(this.contractToken, "Transfer")
                .withArgs(owner.address, user1.address, 50);
            //
            expect(await this.contractToken.balanceOf(spender), "Spender balance").to.be.equal(OWNER_MINT);
            expect(await this.contractToken.balanceOf(owner.address), "Owner balance").to.be.equal(OWNER_MINT - 50);
            expect(await this.contractToken.balanceOf(user1.address), "User balance").to.be.equal(50);
        });
    });

    describe("ERC20", function () {
        it("Should transferFrom allowance success to user", async function () {
            // allowance (owner --> user1)
            await this.contractToken.connect(owner).approve(user1.address, 100);
            expect(await this.contractToken.allowance(owner.address, user1.address)).to.be.equal(100);
            // spending (user1 --> user2)
            // the caller must have allowance for ``from``'s tokens of at least
            await expect(this.contractToken.connect(user1).transferFrom(owner.address, user2.address, 50))
                .to.emit(this.contractToken, "Transfer")
                .withArgs(owner.address, user2.address, 50);
            //
            expect(await this.contractToken.balanceOf(owner.address), "Owner balance").to.be.equal(OWNER_MINT - 50);
            expect(await this.contractToken.balanceOf(user1.address), "User1 balance").to.be.equal(0);
            expect(await this.contractToken.balanceOf(user2.address), "User2 balance").to.be.equal(50);
        });
    });
})