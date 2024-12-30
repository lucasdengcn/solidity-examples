import { expect } from "chai";
import { ignition, ethers } from "hardhat";

import FaRelayRegistryModule from "../ignition/modules/FaRelayRegistryModule";
import { Signer } from "ethers";

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

const ForwardRequest = [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }, // nonce is required for replay protection
    { name: 'deadline', type: 'uint48' }, // deadline is required to limit the time frame
    { name: 'data', type: 'bytes' },
];

describe("FaRelayRegistryTestCases", function () {
    let contract: any;
    let forwarder: any;
    let accounts: Signer[];
    //
    before(async function () {
        //
        const { contract: c, forwarder: f } = await ignition.deploy(FaRelayRegistryModule);
        contract = c;
        forwarder = f;
        accounts = await ethers.getSigners();
        //
        // console.log("forwarder: ", forwarder);
        // console.log("contract: ", contract);
    });
    //
    it("Register a name directly", async function () {
        const sender = accounts[1];
        const reg = await contract.connect(sender);
        const name = "apple";
        const senderAddress = await sender.getAddress();
        //
        await expect(reg.register(name)).emit(reg, "Registered").withArgs(senderAddress, name);
        //
        expect(await contract.owners(name)).to.equal(senderAddress);
        expect(await contract.names(senderAddress)).to.equal(name);
    });
    //
    it("Verify signature with valid request", async function () {
        const signer = accounts[2];
        const relayer = accounts[3];
        const signerAddress = await signer.getAddress();
        //
        const name = "banana";
        const chainId = (await ethers.provider.getNetwork()).chainId;
        //
        const _forwarder = await forwarder.connect(relayer);
        const _forwarderAddress = await _forwarder.getAddress();
        const _contractAddress = await contract.getAddress();
        //
        const domain = {
            name: 'ERC2771Forwarder',
            version: '1',
            chainId: chainId,
            verifyingContract: _forwarderAddress
        };
        const nonce = await _forwarder.nonces(signerAddress);
        const request = {
            from: signerAddress,
            to: _contractAddress,
            value: 0,
            gas: 1e6,
            deadline: toDeadline(1000 * 60 * 60 * 5),
            data: contract.interface.encodeFunctionData("register", [name])
        };
        const msgDataTypes = {
            ForwardRequest: ForwardRequest
        };
        // follow EIP-712 to generate the signature.
        const signature = await signer.signTypedData(domain, msgDataTypes, {...request, nonce: nonce});
        //
        // console.log("signature: ", signature);
        expect(await _forwarder.verify({...request, signature})).to.be.true;
    });
    it("Execute with valid request", async function () {
        const signer = accounts[2];
        const relayer = accounts[3];
        const signerAddress = await signer.getAddress();
        //
        const name = "banana";
        const chainId = (await ethers.provider.getNetwork()).chainId;
        //
        const _forwarder = await forwarder.connect(relayer);
        const _forwarderAddress = await _forwarder.getAddress();
        const _contractAddress = await contract.getAddress();
        //
        const domain = {
            name: 'ERC2771Forwarder',
            version: '1',
            chainId: chainId,
            verifyingContract: _forwarderAddress
        };
        const nonce = await _forwarder.nonces(signerAddress);
        const request = {
            from: signerAddress,
            to: _contractAddress,
            value: 0,
            gas: 1e6,
            deadline: toDeadline(1000 * 60 * 60 * 5),
            data: contract.interface.encodeFunctionData("register", [name])
        };
        const msgDataTypes = {
            ForwardRequest: ForwardRequest
        };
        // follow EIP-712 to generate the signature.
        const signature = await signer.signTypedData(domain, msgDataTypes, {...request, nonce: nonce});
        //
        const tx = await _forwarder.execute({...request, signature});
        await expect(tx)
                .emit(contract, "Registered").withArgs(signerAddress, name);
        await expect(tx)
                .emit(_forwarder, "ExecutedForwardRequest")
                .withArgs(signerAddress, nonce, true);
        
        expect(await _forwarder.nonces(signerAddress)).to.equal(nonce + 1n);
        //
        expect(await contract.owners(name)).to.equal(signerAddress);
        expect(await contract.names(signerAddress)).to.equal(name);
    });
});