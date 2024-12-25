import { expect } from "chai";
import { ethers, upgrades } from "hardhat";


describe("AppleUUPSProxy via Storage Gap", async function () {
    //
    let contract: any;
    let owner: any, user1: any, user2: any;
    //
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("AppleContract");
        const contract_ = await upgrades.deployProxy(contractFactory,
            [owner.address],
            {
                initializer: "initialize",
                kind: "uups"
            }
        );
        await contract_.waitForDeployment();
        contract = contract_;
        //
        const event = contract.getEvent("Initialized");
        contract.on(event, (event:any) => {
            // Emitted whenever a token transfer occurs
            console.log("event: ", event);
        });
    })
    //
    describe("V1 Cases", async function () {
        it("Should be interactable via proxy", async function () {
            expect(await contract.connect(user1).version()).to.equal("1.0.0");
        });
        it("Should appleCount be 100", async function () {
            expect(await contract.connect(user1).appleCount()).to.equal(100);
        });
        it("Should applePrice0 be 10", async function () {
            expect(await contract.connect(user1).price0()).to.equal(10);
        });
        it("Should change Price0 be 15", async function () {
            // resp is ContractTransactionResponse
            const resp = await contract.connect(user1).changePrice(15);
            console.log(resp.data);
            expect(await contract.connect(user1).price0()).to.equal(15);
        });
        //
        describe("Performing upgrade to V2 via inheritance", async function () {
            //
            it("Should upgrade validation be ok", async function () {
                const contractV2Factory = await ethers.getContractFactory("AppleContractV2");
                await upgrades.validateUpgrade(contract, contractV2Factory, {
                    unsafeAllowRenames: true,
                    unsafeSkipStorageCheck: true,
                    unsafeAllowLinkedLibraries: true
                });
            });
            //
            it("Should upgrade successfully", async function () {
                const contractV2Factory = await ethers.getContractFactory("AppleContractV2");
                const contractV2 = await upgrades.upgradeProxy(contract, contractV2Factory, { call: { fn: "initializeV2", args: [owner.address] } });
                expect(await contractV2.version()).to.equal("2.0.0");
                expect(await contractV2.getAddress()).to.equal(await contract.getAddress());
                contract = contractV2;
            });

            it("Should contract return 2.0.0", async function () {
                expect(await contract.version()).to.equal("2.0.0");
            })

            it("Should appleCount be 100", async function () {
                expect(await contract.connect(user1).appleCount()).to.equal(100);
            });

            it("Should applePrice0 be 15", async function () {
                expect(await contract.connect(user1).price0()).to.equal(15);
            });

            it("Should applePrice1 be 20", async function () {
                expect(await contract.connect(user1).price1()).to.equal(20);
            });

        });
    })
});