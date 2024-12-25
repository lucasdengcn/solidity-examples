import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import CookieClickerArtifact from "../artifacts/contracts/CookieClicker.sol/CookieClicker.json";

describe("CookieClickerTestCases", function () {
    //
    let contract: any;
    let owner: any, user1: any, user2: any;
    // deploy contract
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("CookieClicker");
        contract = await contractFactory.deploy();
        //
    })
    //

    it("Should incr by 1", async function () {
        await contract.connect(user1).click();
        expect(await contract.connect(user1).cookies()).to.equal(1);
    });

    it("Should multicall by 11", async function () {
        let iface = new ethers.Interface(CookieClickerArtifact.abi);
        let clickFuncData = iface.encodeFunctionData("click");
        //
        const tx = await contract.connect(user1).multicall(Array(10).fill(clickFuncData));
        // console.log(tx)
        expect(await contract.connect(user1).cookies()).to.equal(11);
    });

    it("Should nonces by 1", async function () {
        await contract.connect(user1).nonce(user1.address);
    });

    it("Should multi nonces by 5", async function () {
        const users = await ethers.getSigners();
        let iface = new ethers.Interface(CookieClickerArtifact.abi);
        const datas = Array(5);
        for (let i = 0; i < 5; i++) {
            datas[i] = iface.encodeFunctionData("nonce", [users[i].address]);
        }
        //
        await contract.connect(user1).multicall(datas);
    });
});