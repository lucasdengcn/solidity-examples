import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CoingeckoOracleModule = buildModule("CoingeckoOracleModule", (m) => {

  const contract = m.contract("CoingeckoOracle", [], {
  });

  return { contract };
});

export default CoingeckoOracleModule;