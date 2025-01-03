import { ethers, ignition } from "hardhat";
import { expect } from "chai";
import { Signer, encodeBytes32String } from "ethers";

import DemoTokenModule from "../ignition/modules/DemoTokenModule";

const TransferWithAuthorizationTypes = {
    TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
    ],
};

const ReceiveWithAuthorizationTypes = {
    ReceiveWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
    ],
};

function randomHexString(length: number): string {
    const randomBytes = ethers.randomBytes(Math.ceil(length / 2)); // Generate random bytes
    const randomHexString = ethers.hexlify(randomBytes); // Convert random bytes to a hexadecimal string
    return randomHexString.slice(2, 2 + length); // Trim the string to the desired length
}

describe("DemoEIP3009", function () {
    let demoToken: any;
    let accounts: Signer[];
    //
    it("should deploy DemoToken contract", async function () {
        accounts = await ethers.getSigners();
        const { contract } = await ignition.deploy(DemoTokenModule);
        demoToken = contract;
        expect(await demoToken.balanceOf(await accounts[0].getAddress())).to.be.above(0);
        //
    });

    async function prepareAuthorization(from: Signer, to: Signer, amount: string, afterInSeconds: number = 0): Promise<any> {
        const ownerAddress = await from.getAddress();
        const recipientAddress = await to.getAddress();
        // Transfer 100 tokens from owner to recipient
        const validAfter = Math.floor(Date.now() / 1000) + afterInSeconds; // Now
        const validBefore = validAfter + 3600; // 1 hour from validAfter
        const value = ethers.parseEther(amount); // Amount to transfer
        const nonce = encodeBytes32String(randomHexString(16));
        //
        const domain = {
            name: await demoToken.name(),
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: await demoToken.getAddress(),
        }
        //
        const authorization = {
            from: ownerAddress,
            to: recipientAddress,
            value: value,
            validAfter: validAfter,
            validBefore: validBefore,
            nonce: nonce,
        };
        //
        return { domain, authorization };
    }

    describe("TransferWithAuthorization", function () {

        it("should transferWithAuthorization successfully", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            //
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "30");
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature via payer wallet. user wants to transfer 10 tokens to recipient
            const signature = await payer.signTypedData(domain, TransferWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Transfer with authorization (MasterWallet) in gasPayer account
            const tx = await demoToken.connect(gasPayer).transferWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s);
            // verify the events
            expect(tx).to.emit(demoToken, "AuthorizationUsed")
                .withArgs(payerAddress, nonce);
            expect(tx).to.emit(demoToken, "Transfer")
                .withArgs(payerAddress, recipientAddress, value);
            //
            expect(await demoToken.balanceOf(recipientAddress)).to.be.equal(value);
            // will revert if the same authorization is used again
            await expect(demoToken.connect(recipient).transferWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009AuthorizationUsed");
        });

        it("should revert transferWithAuthorization if the execution before effective day", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            // will be effective after 10 minutes
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "30", 600);
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature via payer wallet. user wants to transfer 10 tokens to recipient
            const signature = await payer.signTypedData(domain, TransferWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Transfer with authorization (MasterWallet) in gasPayer account
            // this transaction will be failed.
            await expect(demoToken.connect(gasPayer).transferWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009AuthorizationNotValidAfter");
            //
        });

        it("should revert transferWithAuthorization if the authorization expired", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            // authorization on 1 hour ago.
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "30", -3700);
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature via payer wallet. user wants to transfer 10 tokens to recipient
            const signature = await payer.signTypedData(domain, TransferWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Transfer with authorization (MasterWallet) in gasPayer account
            // this transaction will be failed.
            await expect(demoToken.connect(gasPayer).transferWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009AuthorizationExpired");
            //
        });

    });

    describe("ReceiveWithAuthorization", function () {

        it("should receiveWithAuthorization successfully", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            //
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "5");
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature
            const signature = await payer.signTypedData(domain, ReceiveWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Receive with authorization, needs to call by recipient
            await demoToken.connect(recipient).receiveWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s);
            //
            const value2 = ethers.parseEther("35"); // total Amount to transfer
            expect(await demoToken.balanceOf(recipientAddress)).to.be.equal(value2);
        });

        it("should revert receiveWithAuthorization if the execution before effective day", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            // will be effective after 10 minutes
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "5", 600);
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature
            const signature = await payer.signTypedData(domain, ReceiveWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Receive with authorization, needs to call by recipient
            // this transaction will be failed.
            await expect(demoToken.connect(recipient).receiveWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009AuthorizationNotValidAfter");
            //
        });

        it("should revert receiveWithAuthorization if the authorization expired", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            // authorization on 1 hour ago.
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "5", -3700);
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature
            const signature = await payer.signTypedData(domain, ReceiveWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Receive with authorization, needs to call by recipient
            // this transaction will be failed.
            await expect(demoToken.connect(recipient).receiveWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009AuthorizationExpired");
            //
        });

        it("should revert receiveWithAuthorization if the authorization is not execute by the recipient", async function () {
            // demostrate UserWallet, Master Wallet and Recipient
            const payer = accounts[0]; // holds the tokens and not paying gas
            const gasPayer = accounts[1]; // pays the gas
            const recipient = accounts[2]; // receives the tokens
            //
            const payerAddress = await payer.getAddress();
            const recipientAddress = await recipient.getAddress();
            //
            // console.log("payerAddress: ", payerAddress);
            // console.log("recipientAddress: ", recipientAddress);
            // authorization on 1 hour ago.
            const { domain, authorization } = await prepareAuthorization(payer, recipient, "5");
            const { validAfter, validBefore, value, nonce } = authorization;
            // Generate the signature
            const signature = await payer.signTypedData(domain, ReceiveWithAuthorizationTypes, authorization);
            expect(signature).to.be.not.empty;
            const sign = ethers.Signature.from(signature);
            //
            // Receive with authorization, needs to call by recipient
            // this transaction will be failed.
            await expect(demoToken.connect(gasPayer).receiveWithAuthorization(payerAddress, recipientAddress, value, validAfter, validBefore, nonce, sign.v, sign.r, sign.s))
                .to.revertedWithCustomError(demoToken, "ERC3009SenderNotMatch");
            //
        });
    });



});