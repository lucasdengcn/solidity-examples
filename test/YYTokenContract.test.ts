import { expect } from "chai";
import { ignition, ethers } from "hardhat";
import hre from "hardhat";

import YYTokenProxyModule from "../ignition/modules/YYTokenProxyModule";
import YYTokenUpgradeModule from "../ignition/modules/YYTokenUpgradeModule";

import { ZeroAddress } from "ethers";

describe("YYTokenContract", async function () {
    //
    let yyTokenContract: any, yyTokenProxy: any, yyTokenProxyAdmin: any;
    let yyTokenContractV2: any;
    let owner: any, user1: any, user2: any;
    //
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const { yyToken, proxy, proxyAdmin} = await ignition.deploy(YYTokenProxyModule);
        //
        yyTokenContract = yyToken;
        yyTokenProxy = proxy;
        yyTokenProxyAdmin = proxyAdmin;
        //        
        ethers.provider.once("YYTokenContractUpgrated", (event) => {
            console.log("event: ", event);      
        });
    })
    //
    describe("V1 Cases", async function () {
        it("Should be interactable via proxy", async function () {
            expect(await yyTokenContract.connect(user1).version()).to.equal("1.0.0");
        });
        it("Should be contract's name YYToken", async function () {
            expect(await yyTokenContract.connect(user1).name()).to.equal("YYToken");
        });
        
        it("Should increate stat field1 by 1", async function () {
            expect(await yyTokenContract.connect(owner).incrementCreateCount())
                .to.emit(yyTokenContract, "YYStatChanged")
                .withArgs(1, 0, 0);
            //
            const stat = await yyTokenContract.getStatDetail();
            expect(stat.field1).to.equal(1);
        });
    
        it("Should increate stat field2 by 1", async function () {
            expect(await yyTokenContract.connect(owner).incrementUpdateCount())
                .to.emit(yyTokenContract, "YYStatChanged")
                .withArgs(1, 1, 0);
            //
            const stat = await yyTokenContract.getStatDetail();
            expect(stat.field2).to.equal(1);
        });
    
        it("Should increate stat field3 by 1", async function () {
            expect(await yyTokenContract.connect(owner).incrementViewCount())
                .to.emit(yyTokenContract, "YYStatChanged")
                .withArgs(1, 1, 1);
            //
            const stat = await yyTokenContract.getStatDetail();
            expect(stat.field3).to.equal(1);
        });

        it("Should be 1000000 tokens for owner", async function () {
            expect(await yyTokenContract.balanceOf(owner.address)).to.equal(1000000);
        });

        it("Should be success to transform 100 tokens to user1", async function () {
            await yyTokenContract.connect(owner).transfer(user1.address, 100);
            expect(await yyTokenContract.balanceOf(user1.address)).to.equal(100);
            expect(await yyTokenContract.balanceOf(owner.address)).to.equal(1000000-100);
        });

        describe("Performing upgrade", async function () {
            //
            it("Should upgrade successfully", async function () {
                // console.log(Date.now());
                const { yyTokenNew } = await ignition.deploy(YYTokenUpgradeModule);
                yyTokenContractV2 = yyTokenNew;
                expect(await yyTokenContractV2.connect(user1).version()).to.equal("2.0.0");
                // console.log("yyTokenContract: ", await yyTokenContractV2.getAddress());
            });
            
        });

    });

});
