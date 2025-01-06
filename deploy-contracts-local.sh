npx hardhat clean && npx hardhat compile && npx hardhat export-abi

# deploy contracts
npx hardhat ignition deploy ./ignition/modules/AppleContractProxyModule.ts --network localhost --strategy create2
npx hardhat ignition deploy ./ignition/modules/AppleContractUpgradeModule.ts --network localhost --strategy create2

# deploy abi to TheGraph
cp -fr abi/contracts/AppleContract.sol/AppleContract.json ../subgraph001/abis/AppleContract.json
cp -fr abi/contracts/AppleContractV2.sol/AppleContractV2.json ../subgraph001/abis/AppleContractV2.json

# deploy abi to frontend app
cp -fr artifacts/contracts/AppleContract.sol ../frontend-app001/src/contracts/
cp -fr artifacts/contracts/AppleContractV2.sol ../frontend-app001/src/contracts/

# deploy abi to backend app
cp -fr contracts/AppleContract.sol ../spring-web3-demo/src/main/solidity/AppleContract.sol
cp -fr contracts/AppleContractV2.sol ../spring-web3-demo/src/main/solidity/AppleContractV2.sol