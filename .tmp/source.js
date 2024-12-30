// web3-functions/event-listener/index.ts
import {
  Web3Function
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
var MAX_RANGE = 100;
var MAX_REQUESTS = 100;
var ORACLE_ABI = ["event PriceUpdated(uint256 indexed timeStamp, uint256 price)"];
var COUNTER_ABI = ["function increaseCount(uint256)"];
Web3Function.onRun(async (context) => {
  const { userArgs, storage, multiChainProvider } = context;
  const provider = multiChainProvider.default();
  const oracleAddress = userArgs.oracle;
  const counterAddress = userArgs.counter;
  const oracle = new Contract(oracleAddress, ORACLE_ABI, provider);
  const counter = new Contract(counterAddress, COUNTER_ABI, provider);
  const topics = [oracle.interface.getEventTopic("PriceUpdated")];
  const currentBlock = await provider.getBlockNumber();
  const lastBlockStr = await storage.get("lastBlockNumber");
  let lastBlock = lastBlockStr ? parseInt(lastBlockStr) : currentBlock - 2e3;
  let totalEvents = parseInt(await storage.get("totalEvents") ?? "0");
  console.log(`Last processed block: ${lastBlock}`);
  console.log(`Total events matched: ${totalEvents}`);
  const logs = [];
  let nbRequests = 0;
  while (lastBlock < currentBlock && nbRequests < MAX_REQUESTS) {
    nbRequests++;
    const fromBlock = lastBlock + 1;
    const toBlock = Math.min(fromBlock + MAX_RANGE, currentBlock);
    console.log(`Fetching log events from blocks ${fromBlock} to ${toBlock}`);
    try {
      const eventFilter = {
        address: oracleAddress,
        topics,
        fromBlock,
        toBlock
      };
      const result = await provider.getLogs(eventFilter);
      logs.push(...result);
      lastBlock = toBlock;
    } catch (err) {
      console.error(`Failed to fetch logs:`, err);
      return {
        canExec: false,
        message: `Rpc call failed: ${err.message}`
      };
    }
  }
  console.log(`Matched ${logs.length} new events`);
  const nbNewEvents = logs.length;
  totalEvents += logs.length;
  for (const log of logs) {
    const event = oracle.interface.parseLog(log);
    const [time, price] = event.args;
    console.log(
      `Price updated: ${price}$ at ${new Date(time * 1e3).toUTCString()}`
    );
  }
  await storage.set("lastBlockNumber", currentBlock.toString());
  await storage.set("totalEvents", totalEvents.toString());
  if (nbNewEvents === 0) {
    return {
      canExec: false,
      message: `Total events matched: ${totalEvents} (at block #${currentBlock.toString()})`
    };
  }
  return {
    canExec: true,
    callData: [
      {
        to: counterAddress,
        data: counter.interface.encodeFunctionData("increaseCount", [
          nbNewEvents
        ])
      }
    ]
  };
});
