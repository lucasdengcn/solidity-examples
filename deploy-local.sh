#npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia --deployment-id sepolia-deployment
#npx hardhat ignition verify sepolia-deployment

npx hardhat ignition deploy ignition/modules/CounterV2Module.ts --network localhost --strategy create2

npx hardhat ignition deploy ignition/modules/GldTokenViaCreate2Module.ts --network localhost --strategy create2
