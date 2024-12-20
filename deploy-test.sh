#npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia --deployment-id sepolia-deployment
#npx hardhat ignition verify sepolia-deployment

npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia --verify

npx hardhat test test/GldToken.ts