import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CounterV2Module = buildModule("CounterV2Module", (m) => {

  const contract = m.contract("CounterV2", [], {
  });

  return { contract };
});

export default CounterV2Module;