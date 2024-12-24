import { expect } from "chai";
import { ethers, upgrades } from "hardhat";


describe("YYTokenTransparentProxy", async function () {
    //
    let yyTokenContract: any;
    let yyTokenContractV2: any;
    let owner: any, user1: any, user2: any;
    //
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const yyTokenContractFactory = await ethers.getContractFactory("YYTokenContractV1");
        const contract = await upgrades.deployProxy(yyTokenContractFactory,
            [owner.address],
            {
                initializer: "initialize",
                kind: "transparent",  // 'uups' | 'transparent' | 'beacon';
                initialOwner: owner.address
            }
        );
        await contract.waitForDeployment();
        yyTokenContract = contract;
        //
        yyTokenContract.on("YYTokenContractUpgrated", (event: any) => {
            console.log("YYTokenContractUpgrated event: ", event);
        });
        console.log("yyTokenContract: ", await yyTokenContract.getAddress());
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
            expect(await yyTokenContract.balanceOf(owner.address)).to.equal(1000000 - 100);
        });

        describe("Performing upgrade to V2", async function () {
            //
            it("Should upgrade validation be ok", async function () {
                const yyTokenContractV2Factory = await ethers.getContractFactory("YYTokenContractV2");
                await upgrades.validateUpgrade(yyTokenContract, yyTokenContractV2Factory, {
                    unsafeAllowRenames: true,
                    unsafeSkipStorageCheck: false,
                    unsafeAllowLinkedLibraries: true
                });
            });
            //
            it("Should upgrade successfully", async function () {
                const yyTokenContractV2Factory = await ethers.getContractFactory("YYTokenContractV2");
                yyTokenContractV2 = await upgrades.upgradeProxy(yyTokenContract, yyTokenContractV2Factory, { call: { fn: "upgratePostEvent", args: [] } });
                expect(await yyTokenContractV2.version()).to.equal("2.0.0");
                expect(await yyTokenContractV2.getAddress()).to.equal(await yyTokenContract.getAddress());
            });

            it("Should yyTokenContract return 2.0.0", async function () {
                expect(await yyTokenContract.version()).to.equal("2.0.0");
            })

            it("Should balance the same for owner after upgrade", async function () {
                expect(await yyTokenContractV2.balanceOf(owner.address)).to.equal(1000000 - 100);
            })

            it("Should be able to read previous stat fields", async function () {
                const stat = await yyTokenContractV2.getStatDetail();
                expect(stat.field1).to.equal(1);
                expect(stat.field2).to.equal(1);
                expect(stat.field3).to.equal(1);
            });

        });

    })
});