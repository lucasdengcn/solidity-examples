import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('MappingExample', function () {
  async function loadFixtureContracts() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2] = await hre.ethers.getSigners();
    const Contract = await hre.ethers.getContractFactory('MappingExample');
    const contract = await Contract.deploy();
    //
    return { contract, owner, user1, user2 };
  }

  describe('Mapping Deposit', function () {
    it('Should deposit success', async function () {
      const { contract, user1 } = await loadFixture(loadFixtureContracts);
      await expect(contract.deposit(user1.getAddress(), 100)).not.to.be.reverted;
      expect(await contract.balanceOf(user1.getAddress())).to.be.equal(100);
    });
    it('Should be balance == 0 given non exist account', async function () {
      const { contract, user1 } = await loadFixture(loadFixtureContracts);
      expect(await contract.balanceOf(user1.getAddress())).to.be.equal(0);
    });
    it('Should remove success given exist account', async function () {
      const { contract, user1 } = await loadFixture(loadFixtureContracts);
      await expect(contract.deposit(user1.getAddress(), 100)).not.to.be.reverted;
      expect(await contract.balanceOf(user1.getAddress())).to.be.equal(100);
      expect(await contract.remove(user1.getAddress())).not.to.be.reverted;
    });
  });

  describe('Mapping Loan', function () {
    it('Should loan success', async function () {
      const { contract, user1, user2 } = await loadFixture(loadFixtureContracts);
      await expect(contract.loanTo(user1.getAddress(), 100)).not.to.be.reverted;
      const tx = await contract.loan(user1.getAddress());
      console.log(tx);
    });
    it('Should not found given user2', async function () {
      const { contract, user1, user2 } = await loadFixture(loadFixtureContracts);
      // await expect(contract.loanTo(user2.getAddress(), 100)).not.to.be.reverted;
      const tx = await contract.hasLoan(user2.getAddress());
      expect(tx).to.be.false;
      console.log(tx);
    });
  });
});
