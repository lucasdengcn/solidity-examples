import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

import { ethers } from "hardhat";
import { BaseContract, Signer } from "ethers";

const {
    AllowanceTransfer, // Useful for generating permit data for allowance style approvals
    SignatureTransfer, // Useful for generating permit data for signature style approvals
    PERMIT2_ADDRESS, // 0x000000000022D473030F116dDEE9F6B43aC78BA3
    MaxAllowanceTransferAmount } = require('@uniswap/permit2-sdk');

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

const TOKEN_PERMISSIONS = [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
];

const PERMIT_TRANSFER_FROM_TYPES = {
    PermitTransferFrom: [
        { name: 'permitted', type: 'TokenPermissions' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
    TokenPermissions: TOKEN_PERMISSIONS,
};

const PERMIT_TRANSFER_WITH_WITNESS_FROM_TYPES = {
    PermitTransferFrom: [
        { name: 'permitted', type: 'TokenPermissions' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'witness', type: 'Witness' },
    ],
    TokenPermissions: TOKEN_PERMISSIONS,
    Witness: [{ name: 'user', type: 'address' }],
};

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

describe("Permit2App", function () {
    let [owner, user1, user2]: Signer[] = [];
    let permit2: any;
    let keeper: any;
    let token: GldToken;
    const amount = 100_000;
    const transferAmount = 1_000;

    beforeEach(async function () {
        // Contracts are deployed using the first signer/account by default
        [owner, user1, user2] = await hre.ethers.getSigners();
        //
        const TokenFactory = await hre.ethers.getContractFactory("GldToken");
        token = await TokenFactory.deploy(amount);
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
        await token.connect(owner).transfer(await user1.getAddress(), transferAmount);
    });

    describe("Token", function () {
        it("Should balance equal to 1_000", async function () {
            await expect(token.balanceOf(await user1.getAddress())).to.eventually.equal(transferAmount);
        });
    });

    describe("Permit2", function () {
        it("Should be permit2 address", async function () {
            await expect(permit2.getAddress()).to.eventually.equal(await keeper.permit2());
        });
        it("Should permit success given valid signature and approval", async function () {
            const nonce = 0;
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            const userAddress = await user1.getAddress();
            //
            // console.log(tokenAddress, permit2Address, keeperAddress, userAddress);
            //
            const permitSingle = {
                details: {
                    token: tokenAddress,
                    amount: BigInt("0xffffffffffffffffffffffffffffffffffffffff"),
                    expiration: toDeadline(1000 * 60 * 60 * 24 * 30),
                    nonce,
                },
                spender: keeperAddress,
                sigDeadline: toDeadline(1000 * 60 * 60 * 5),
            };
            const domain = {
                name: "Permit2",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: permit2Address,
            };
            //
            const signature = await user1.signTypedData(domain, PERMIT_TYPES, permitSingle);
            //
            await expect(keeper.connect(user1).permitWithPermit2(permitSingle, signature))
                .not.to.be.reverted;
            //
            const resp = await permit2.allowance(userAddress, tokenAddress, keeperAddress);
            // console.log(resp);
            expect(resp[0]).to.be.equal(BigInt("0xffffffffffffffffffffffffffffffffffffffff"));
        });
        it("Should permit and transfer success given valid signature and approval", async function () {
            const nonce = 0;
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            //
            //
            const permitSingle = {
                details: {
                    token: tokenAddress,
                    amount: BigInt("0xffffffffffffffffffffffffffffffffffffffff"),
                    expiration: toDeadline(1000 * 60 * 60 * 24 * 30),
                    nonce,
                },
                spender: keeperAddress,
                sigDeadline: toDeadline(1000 * 60 * 60 * 5),
            };
            const domain = {
                name: "Permit2",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: permit2Address,
            };
            //
            const signature = await user1.signTypedData(domain, PERMIT_TYPES, permitSingle);
            // traditional approval first then transfer
            await token.connect(user1).approve(permit2Address, amount);
            //
            await keeper.connect(user1).allowanceTransferWithPermit(permitSingle, signature, 100);
            //
            // console.log(resp);
            await expect(token.balanceOf(await user1.getAddress())).to.eventually.equal(transferAmount - 100);
            await expect(token.balanceOf(await keeper.getAddress())).to.eventually.equal(100);
            //
            await keeper.connect(user1).allowanceTransferWithoutPermit(tokenAddress, 100);
            //
            await expect(token.balanceOf(await user1.getAddress())).to.eventually.equal(transferAmount - 100 - 100);
            await expect(token.balanceOf(await keeper.getAddress())).to.eventually.equal(100 + 100);
        });
        it("Should permit and transfer success given valid one-time signature", async function () {
            const deadline = toDeadline(1000 * 60 * 60 * 30);
            const nonce = Math.floor(Math.random() * 1e15);
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            //
            const permitAmount = 100;
            const permit = {
                permitted: {
                    token: tokenAddress,
                    amount: permitAmount
                },
                spender: keeperAddress,
                nonce,
                deadline: deadline, // deadline on the signature.
            };
            const domain = {
                name: "Permit2",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: permit2Address,
            };
            //
            const signature = await user1.signTypedData(domain, PERMIT_TRANSFER_FROM_TYPES, permit);
            // console.log("Signature:", signature);
            // traditional approval first then transfer
            await token.connect(user1).approve(permit2Address, permitAmount);
            //
            await keeper.connect(user1).signatureTransfer(tokenAddress, permitAmount, nonce, deadline, signature);
            //
            await expect(token.balanceOf(await user1.getAddress())).to.eventually.equal(transferAmount - permitAmount);
            await expect(token.balanceOf(await keeper.getAddress())).to.eventually.equal(permitAmount);
            //
        });
        it("Should permit and transfer success given witness and valid one-time signature", async function () {
            const deadline = toDeadline(1000 * 60 * 60 * 30);
            const nonce = Math.floor(Math.random() * 1e15);
            //
            const tokenAddress = await token.getAddress();
            const permit2Address = await permit2.getAddress();
            const keeperAddress = await keeper.getAddress();
            const userAddress = await user1.getAddress();
            //
            const permitAmount = 100;
            const permit = {
                permitted: {
                    token: tokenAddress,
                    amount: permitAmount
                },
                spender: keeperAddress,
                nonce,
                deadline: deadline, // deadline on the signature.
            };
            const witness = {
                witnessTypeName: 'Witness', // type name must match the struct name we created in Permit2App
                witnessType: { Witness: [{ name: 'user', type: 'address' }] }, // must match structs data
                witness: { user: userAddress }, // witness' value
            }
            const chainId = (await hre.ethers.provider.getNetwork()).chainId;
            const { domain, types, values } = SignatureTransfer.getPermitData(permit, permit2Address, chainId, witness);
            //
            // console.log("domain: ", domain);
            // console.log("types: ", types);
            // console.log("values: ", values);
            //
            const signature = await user1.signTypedData(domain, types, values);
            // traditional approval first then transfer
            await token.connect(user1).approve(permit2Address, permitAmount);
            //
            await keeper.connect(user1).signatureTransferWithWitness(tokenAddress, permitAmount, nonce, deadline, userAddress, signature);
            //
            await expect(token.balanceOf(userAddress)).to.eventually.equal(transferAmount - permitAmount);
            await expect(token.balanceOf(keeperAddress)).to.eventually.equal(permitAmount);
            //
        });
    });
});