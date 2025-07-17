import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useStore } from "../store";

export default function Home() {
  const [inputEth, setInputEth] = useState("0.5");

  const {
    chains: { ethereum },
    usdPrice,
    setGasData,
    setUsdPrice,
    mode,
    setMode,
  } = useStore();

  // Real-time gas fee via WebSocket
  useEffect(() => {
    if (mode !== "live") return;

    const provider = new ethers.providers.WebSocketProvider(
      "wss://mainnet.infura.io/ws/v3/d456771d022f423bbdb73aea1be7ae01"
    );

    provider.on("block", async (blockNumber: number) => {
      const block = await provider.getBlock(blockNumber);
      const baseFee = Number(
        ethers.utils.formatUnits(block.baseFeePerGas || 0, "gwei")
      );
      const priorityFee = 2; // static for demo
      setGasData({ baseFee, priorityFee });
    });

    return () => {
      provider.removeAllListeners();
      provider.destroy();
    };
  }, [mode, setGasData]);

  // Fetch ETH/USD from Uniswap V3
  useEffect(() => {
    const fetchEthUsd = async () => {
      try {
        const iface = new ethers.utils.Interface([
          "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
        ]);

        const provider = new ethers.providers.JsonRpcProvider(
          "https://mainnet.infura.io/v3/d456771d022f423bbdb73aea1be7ae01"
        );

        const currentBlock = await provider.getBlockNumber();

        const logs = await provider.getLogs({
          address: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", // ETH/USDC pool
          topics: [iface.getEventTopic("Swap")],
          fromBlock: currentBlock - 1000,
          toBlock: currentBlock,
        });

        if (logs.length === 0) {
          console.warn("No swap logs found.");
          return;
        }

        const parsed = iface.parseLog(logs[logs.length - 1]);
        const sqrtPriceX96 = parsed.args.sqrtPriceX96 as ethers.BigNumber;

        const price = sqrtPriceX96
          .mul(sqrtPriceX96)
          .div(ethers.BigNumber.from(2).pow(192));

        const ethUsd = 1 / Number(ethers.utils.formatUnits(price, 6));
        setUsdPrice(ethUsd);
      } catch (err) {
        console.error("🔴 Failed to fetch ETH/USD price:", err);
      }
    };

    fetchEthUsd();
  }, [setUsdPrice]);

  const gasCostUSD = (
    (ethereum.baseFee + ethereum.priorityFee) *
    21000 *
    usdPrice
  ).toFixed(2);

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">⛽ Gas Price Tracker (Ethereum MVP)</h1>

      <div className="my-4">
        <label className="mr-2 font-semibold">Transaction Value (ETH):</label>
        <input
          className="border px-2 py-1 rounded"
          type="number"
          step="0.01"
          value={inputEth}
          onChange={(e) => setInputEth(e.target.value)}
        />
      </div>

      <div className="my-4 space-y-1 text-gray-800">
        <p>📦 Base Fee: <strong>{ethereum.baseFee}</strong> gwei</p>
        <p>⚡ Priority Fee: <strong>{ethereum.priorityFee}</strong> gwei</p>
        <p>💰 ETH/USD: <strong>${usdPrice.toFixed(2)}</strong></p>
        <p className="text-lg font-medium mt-2">
          ✅ Estimated Gas Cost (USD): <strong>${gasCostUSD}</strong>
        </p>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setMode(mode === "live" ? "simulation" : "live")}
      >
        Switch to {mode === "live" ? "Simulation" : "Live"} Mode
      </button>
    </main>
  );
}
