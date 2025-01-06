# Sample Solidity Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

## Tech Stack

- Solidity 0.8.0
- Openzeppelin 5.1.x
- ERC20
- EIP-2612 (ERC20 Permit)
- ERC20 Permit2
- EIP-3009
- UUPS Proxy pattern
- TransparentUpgradeableProxy
- Error Handling
- Assembly Opcodes
- ERC2771 Forwarder (Relayer, Meta Tx)
- OwnableUpgradeable
- ReentrancyGuardUpgradeable
- Namespaced StorageLayout
- Storage Gap Pattern
- SafeERC20

## Hardhat basic commands

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat check
npx hardhat export-abi
```

Vars

```shell
npx hardhat vars set ETHERSCAN_API_KEY

```

```shell
npx hardhat vars set ACCOUNT_PRIVATE_KEY
```

```shell
npx hardhat vars set INFURA_API_KEY
```

## Foundary

[Foundry](https://hardhat.org/hardhat-runner/docs/advanced/hardhat-and-foundry)

```shell
npx hardhat init-foundry
npx hardhat test
```

## Dependencies

```shell
npm install dotenv
npm install @openzeppelin/contracts
npm install @openzeppelin/contracts-upgradeable
npm add @uniswap/v3-periphery @uniswap/v3-core
## chainlink automation
npm install @chainlink/contracts --save
```

uniswap-v3 depends on openzeppelin-3.3.x

openzeppelin 4.0 above breaks compability.

## Testing

```shell
npm install @uniswap/permit2-sdk
```

```shell
npx hardhat ignition deploy ./ignition/modules/AppleContractProxyModule.ts --network localhost
npx hardhat ignition deploy ./ignition/modules/AppleContractUpgradeModule.ts --network localhost
```

## Plugins

```shell
npm install --save-dev hardhat-tracer
npm install --save-dev hardhat-abi-exporter
npm install --save-dev @nomiclabs/hardhat-solhint
# npm install --save-dev hardhat-gas-reporter 
npm install --save-dev @openzeppelin/hardhat-upgrades
npm install --save-dev @nomicfoundation/hardhat-ethers ethers # peer dependencies
npm install --save-dev @solidstate/hardhat-bytecode-exporter

```

## Solidity Cheatsheet

[Cheatsheet](https://docs.soliditylang.org/en/develop/cheatsheet.html)

## Reference

[Discussion 6151 on Receive Test](https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/6151)
[Graph](https://github.com/graphprotocol/hardhat-graph)

## Blog

<https://abhik.hashnode.dev/>

## The Graph

```shell
npm install -g @graphprotocol/graph-cli@latest
```

## Chainlink Starter kit

<https://github.com/smartcontractkit/hardhat-starter-kit>

```shell

```

## Tools

### lint-staged

Run linters against staged git files.

## Husky

a popular choice for configuring git hooks to run lint-staged

## Permit2 Integration

<https://github.com/KennieHarold/permit2-integration>

### Install Forge

```shell
# or setup manually
git submodule add https://github.com/foundry-rs/forge-std lib/forge-std
cd lib/forge-std
forge install
```

### Install Permit2

```shell
git submodule add https://github.com/Uniswap/permit2 lib/permit2
cd lib/permit2
forge install
forge build
```

## Deployment via Create2

<https://hardhat.org/ignition/docs/guides/create2>

<https://github.com/pcaversaccio/createx>
