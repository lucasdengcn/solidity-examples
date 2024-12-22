import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

import { ethers } from "hardhat";
import { BaseContract, Signer } from "ethers";


import Permit2Artifact from "../lib/permit2/out/Permit2.sol/Permit2.json";
import { GldToken } from "../typechain-types";

const PERMIT_DETAILS = [
    { name: "token", type: "address" },
    { name: "amount", type: "uint160" },
    { name: "expiration", type: "uint48" },
    { name: "nonce", type: "uint48" },
  ];
  
  const PERMIT_TYPES = {
    PermitSingle: [
      { name: "details", type: "PermitDetails" },
      { name: "spender", type: "address" },
      { name: "sigDeadline", type: "uint256" },
    ],
    PermitDetails: PERMIT_DETAILS,
  };

describe("Permit2App", function () {
    let [owner, user1, user2]: Signer[] = [];
    let permit2: any;
    let keeper: any;
    let token: GldToken;

    beforeEach(async function () {
        // Contracts are deployed using the first signer/account by default
        [owner, user1, user2] = await hre.ethers.getSigners();
        //
        const TokenFactory = await hre.ethers.getContractFactory("GldToken");
        token = await TokenFactory.deploy(100_000);
        await token.waitForDeployment();
        //
        const permitFactory = new hre.ethers.ContractFactory(
            Permit2Artifact.abi,
            Permit2Artifact.bytecode,
            owner,
        );
        permit2 = await permitFactory.deploy();
        //
        const Contract = await hre.ethers.getContractFactory("Permit2App");
        keeper = await Contract.deploy(await permit2.getAddress());
        await keeper.waitForDeployment();
        //
    });

    describe("Token", function () {
        it("Should balance equal to 100_000", async function () {
            await expect(token.balanceOf(await owner.getAddress())).to.eventually.equal(100_000);
        });
    });

    describe("Permit2", function () {
        it("Should be permit2 address", async function () {
            await expect(permit2.getAddress()).to.eventually.equal(await keeper.permit2());
        });
        it("Should permit success given valid signature", async function () {
            const amount = 100_000;
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
            const nonce = 0;
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            const ownerAddress = await owner.getAddress();
            //
            // console.log(tokenAddress, permit2Address, keeperAddress, ownerAddress);
            //
            const permitSingle = {
                details: {
                    token: tokenAddress,
                    amount: amount,
                    expiration: deadline,
                    nonce,
                },
                spender: keeperAddress,
                sigDeadline: deadline,
            };
            const domain = {
                name: "Permit2",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: permit2Address,
            };
            //
            const signature = await owner.signTypedData(domain, PERMIT_TYPES, permitSingle);
            //
            await expect(keeper.connect(owner).permitWithPermit2(permitSingle, signature))
                .not.to.be.reverted;
            //
            const resp = await permit2.allowance(ownerAddress, tokenAddress, keeperAddress);
            // console.log(resp);
            expect(resp[0]).to.be.equal(amount);
        });
        it("Should permit and transfer success given valid signature", async function () {
            const amount = 100_000;
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
            const nonce = 0;
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            const ownerAddress = await owner.getAddress();
            //
            // console.log(tokenAddress, permit2Address, keeperAddress, ownerAddress);
            //
            const permitSingle = {
                details: {
                    token: tokenAddress,
                    amount: amount,
                    expiration: deadline,
                    nonce,
                },
                spender: keeperAddress,
                sigDeadline: deadline,
            };
            const domain = {
                name: "Permit2",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: permit2Address,
            };
            //
            const signature = await owner.signTypedData(domain, PERMIT_TYPES, permitSingle);
            // traditional approval first then transfer
            await token.connect(owner).approve(permit2Address, amount);
            //
            await keeper.connect(owner).allowanceTransferWithPermit(permitSingle, signature, 100);
            //
            // console.log(resp);
            await expect(token.balanceOf(await owner.getAddress())).to.eventually.equal(100_000 - 100);
            await expect(token.balanceOf(await keeper.getAddress())).to.eventually.equal(100);
            //
            await keeper.connect(owner).allowanceTransferWithoutPermit(tokenAddress, 100);
            //
            await expect(token.balanceOf(await owner.getAddress())).to.eventually.equal(100_000 - 100 - 100);
            await expect(token.balanceOf(await keeper.getAddress())).to.eventually.equal(100 + 100);
        });
    });

});