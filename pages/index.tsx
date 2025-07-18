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

  // ✅ Real-time gas fee via WebSocket with fallback baseFee
  useEffect(() => {
    if (mode !== "live") return;

    const provider = new ethers.providers.WebSocketProvider(
      "wss://mainnet.infura.io/ws/v3/d456771d022f423bbdb73aea1be7ae01"
    );

    provider.on("block", async (blockNumber: number) => {
      const block = await provider.getBlock(blockNumber);

      let rawBaseFee = block.baseFeePerGas;
      if (!rawBaseFee || rawBaseFee.isZero()) {
        rawBaseFee = ethers.BigNumber.from("5000000000"); // fallback: 5 gwei in wei
      }

      const baseFee = Number(ethers.utils.formatUnits(rawBaseFee, "gwei"));
      const priorityFee = 2; // static for demo

      setGasData({ baseFee, priorityFee });
    });

    return () => {
      provider.removeAllListeners();
      provider.destroy();
    };
  }, [mode, setGasData]);

  // ✅ ETH/USD from CoinGecko (accurate + easy)
  useEffect(() => {
    const fetchEthUsd = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        const ethUsd = data.ethereum.usd;
        setUsdPrice(ethUsd);
      } catch (err) {
        console.error("🔴 Failed to fetch ETH/USD price:", err);
      }
    };

    fetchEthUsd();
    const interval = setInterval(fetchEthUsd, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, [setUsdPrice]);

  const gasCostUSD = (
    (ethereum.baseFee + ethereum.priorityFee) *
    21000 *
    usdPrice /
    1e9
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
