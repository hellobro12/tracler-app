// index.tsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useStore, Chain } from "../store";
import { CandlestickData } from "lightweight-charts";
import CandlestickChart from "@/components/CandlestickChart";
import { UTCTimestamp } from "lightweight-charts";


const RPC_URLS: Record<Chain, string> = {
  ethereum: "wss://mainnet.infura.io/ws/v3/YOUR_INFURA_KEY",
  polygon: "wss://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
  arbitrum: "wss://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
};

export default function Home() {
  const [inputEth, setInputEth] = useState("0.5");

  const {
    chains,
    usdPrice,
    setGasData,
    setUsdPrice,
    mode,
    setMode,
  } = useStore();

  // Real-time gas fee via WebSocket for all chains
  useEffect(() => {
    if (mode !== "live") return;

    const providers: Record<Chain, ethers.providers.WebSocketProvider> = {
      ethereum: new ethers.providers.WebSocketProvider(RPC_URLS.ethereum),
      polygon: new ethers.providers.WebSocketProvider(RPC_URLS.polygon),
      arbitrum: new ethers.providers.WebSocketProvider(RPC_URLS.arbitrum),
    };

    (Object.keys(providers) as Chain[]).forEach((chain) => {
      const provider = providers[chain];
      provider.on("block", async (blockNumber: number) => {
        const block = await provider.getBlock(blockNumber);
        const baseFee = Number(
          ethers.utils.formatUnits(block.baseFeePerGas || 0, "gwei")
        );
        const priorityFee = 2; // static for demo
        setGasData(chain, { baseFee, priorityFee });
      });
    });

    return () => {
      (Object.keys(providers) as Chain[]).forEach((chain) => {
        providers[chain].removeAllListeners();
        providers[chain].destroy();
      });
    };
  }, [mode, setGasData]);

  // ETH/USD via CoinGecko fallback
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
    const interval = setInterval(fetchEthUsd, 30000);
    return () => clearInterval(interval);
  }, [setUsdPrice]);

  // Dummy candlestick data
  const dummyChartData: CandlestickData[] = [
    {
      time: 1689552000 as UTCTimestamp,
      open: 1800,
      high: 1850,
      low: 1750,
      close: 1820,
    },
    {
       time: 1689552600 as UTCTimestamp,
      open: 1820,
      high: 1880,
      low: 1800,
      close: 1860,
    },
    {
       time: 1689553200 as UTCTimestamp,
      open: 1860,
      high: 1900,
      low: 1850,
      close: 1885,
    },
  ];

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">⛽ Gas Price Tracker (Cross-Chain MVP)</h1>

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

      {(Object.keys(chains) as Chain[]).map((chain) => {
        const { baseFee, priorityFee } = chains[chain];
        const costUSD = ((baseFee + priorityFee) * 21000 * usdPrice / 1e9).toFixed(2);

        return (
          <div key={chain} className="my-4 space-y-1 text-gray-800">
            <p className="font-semibold">🔗 {chain.charAt(0).toUpperCase() + chain.slice(1)}</p>
            <p>📦 Base Fee: <strong>{baseFee.toFixed(3)}</strong> gwei</p>
            <p>⚡ Priority Fee: <strong>{priorityFee}</strong> gwei</p>
            <p>💰 ETH/USD: <strong>${usdPrice.toFixed(2)}</strong></p>
            <p className="text-lg font-medium mt-2">
              ✅ Estimated Gas (USD): <strong>${costUSD}</strong>
            </p>
          </div>
        );
      })}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        onClick={() => setMode(mode === "live" ? "simulation" : "live")}
      >
        Switch to {mode === "live" ? "Simulation" : "Live"} Mode
      </button>

      {/* Dummy Candlestick Chart */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">15-Min Candlestick Chart (Dummy)</h2>
        <CandlestickChart data={dummyChartData} />
      </div>
    </main>
  );
}

