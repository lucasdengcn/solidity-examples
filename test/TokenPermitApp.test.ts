import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("TokenPermitApp", function () {
    let owner: any, spender: any, user1: any;
    //
    const OWNER_MINT = 100_000;
    //
    before(async function () {
        [owner, user1] = await hre.ethers.getSigners();
        //
        const Contract0 = await hre.ethers.getContractFactory("GldToken");
        this.contractToken = await Contract0.deploy(OWNER_MINT);
        await this.contractToken.waitForDeployment();
        //
        const Contract = await hre.ethers.getContractFactory("TokenPermitApp");
        this.contractSpender = await Contract.deploy(await this.contractToken.getAddress());
        await this.contractSpender.waitForDeployment();
        spender = await this.contractSpender.getAddress();
        //
    });

    describe("MintPermit", function () {
        it("Should get nonce for owner", async function () {
            // get nonce for user4
            const nonce = await this.contractToken.nonces(owner.address);
            expect(nonce).to.be.equal(0);
        });
        it("TryPermit from owner to silver contract success given valid signature", async function () {
            const amount = 1000;
            // Define the deadline for permit
            const deadline = (await time.latest()) + 3600;
            // Define the domain from smart contract.
            const domain = {
                name: await this.contractToken.name(),
                version: "1",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: (await this.contractToken.getAddress()),
            };
            // console.log("domain:", domain);
            // Define the types
            const types = {
                Permit: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };
            // Define the transaction data from request.
            const value = {
                owner: owner.address,
                spender: spender,
                value: amount,
                nonce: (await this.contractToken.nonces(owner.address)),
                deadline: deadline,
            };
            // console.log("value:", value);
            // Generate the signature
            const signature = await owner.signTypedData(domain, types, value);
            expect(signature).to.be.not.empty;
            const sign = hre.ethers.Signature.from(signature);
            // permit
            // console.log("owner:", owner.address, "spender:", spender, "value:", 1000);
            await expect(this.contractSpender.connect(owner)
                .mint(1000, deadline, sign.v, sign.r, sign.s))
                .to.emit(this.contractToken, "Transfer")
                .withArgs(owner.address, spender, 1000);
            // verify balance.
            expect(await this.contractToken.allowance(owner.address, spender)).to.be.equal(amount);
            expect(await this.contractToken.nonces(owner.address)).to.be.equal(1);
        });

        it("TryPermit from owner to silver contract will reverted given invalid signature", async function () {
            const amount = 1000;
            // Define the deadline for permit
            const deadline = (await time.latest()) + 3600;
            // Define the domain from smart contract.
            const domain = {
                name: await this.contractToken.name(),
                version: "1",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: (await this.contractToken.getAddress()),
            };
            // console.log("domain:", domain);
            // Define the types
            const types = {
                Permit: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };
            // Define the transaction data from request.
            const value = {
                owner: owner.address,
                spender: spender,
                value: amount,
                nonce: (await this.contractToken.nonces(owner.address)),
                deadline: deadline,
            };
            // Generate the signature
            const signature = await owner.signTypedData(domain, types, value);
            expect(signature).to.be.not.empty;
            const sign = hre.ethers.Signature.from(signature);
            // permit
            console.log("owner:", owner.address, "spender:", spender, "value:", 1000);
            await expect(this.contractSpender.connect(user1) // SHOULD BE owner
                .mint(1000, deadline, sign.v, sign.r, sign.s))
                .to.be.revertedWithCustomError(this.contractSpender, "ERC2612InvalidSigner");
            // verify balance.
            expect(await this.contractToken.nonces(owner.address)).to.be.equal(1);
        });

    });

})