// web3-functions/oracle/index.ts
import {
  Web3Function
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
import ky from "ky";
var ORACLE_ABI = [
  "function lastUpdated() external view returns(uint256)",
  "function updatePrice(uint256)"
];
Web3Function.onRun(async (context) => {
  const { userArgs, multiChainProvider, gelatoArgs } = context;
  console.log(`chainId: ${gelatoArgs.chainId}, gasPrice: ${gelatoArgs.gasPrice}, taskId: ${gelatoArgs.taskId}`);
  const provider = multiChainProvider.default();
  const url = provider.connection.url;
  console.log(`Provider URL: ${url}`);
  const oracleAddress = userArgs.oracle;
  let lastUpdated;
  let oracle;
  try {
    oracle = new Contract(oracleAddress, ORACLE_ABI, provider);
    lastUpdated = parseInt(await oracle.lastUpdated());
    console.log(`Last update time: ${lastUpdated}`);
  } catch (error) {
    return { canExec: false, message: `Error retrieving last update time: ${error}` };
  }
  const nextUpdateTime = lastUpdated + 600;
  const timestamp = (await provider.getBlock("latest")).timestamp;
  console.log(`Current time: ${timestamp}`);
  console.log(`Next update time: ${nextUpdateTime}`);
  if (timestamp < nextUpdateTime) {
    return { canExec: false, message: "Not ready for a new update" };
  }
  const currency = userArgs.currency ?? "ethereum";
  let price = 0;
  try {
    const coingeckoApi = await context.secrets.get("COINGECKO_API");
    if (!coingeckoApi)
      return { canExec: false, message: `COINGECKO_API not set in secrets` };
    const coingeckoSimplePriceApi = `${coingeckoApi}/simple/price?ids=${currency}&vs_currencies=usd`;
    console.log(`Coingecko API: ${coingeckoSimplePriceApi}`);
    const priceData = await ky.get(coingeckoSimplePriceApi, { timeout: 5e3, retry: 0 }).json();
    price = Math.floor(priceData[currency].usd);
  } catch (error) {
    return { canExec: false, message: `Error retrieving price: ${error}` };
  }
  console.log(`Updating Price: ${price}`);
  return {
    canExec: true,
    callData: [{
      to: oracleAddress,
      data: oracle.interface.encodeFunctionData("updatePrice", [price])
    }]
  };
});
