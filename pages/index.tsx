
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useStore, Chain } from "../store";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";
import CandlestickChart from "@/components/CandlestickChart";

// rpc url
const RPC_URLS: Record<Chain, string> = {
  ethereum: "wss://mainnet.infura.io/ws/v3/d456771d022f423bbdb73aea1be7ae01",
  polygon: "wss://polygon-mainnet.g.alchemy.com/v2/3YZqyYAfaMPKCmBp0-8TG",
  arbitrum: "wss://arb-mainnet.g.alchemy.com/v2/IewQdFkjUDI4HAxlYT-Xr",
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

  // ETH/USD fetch from CoinGecko
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

  // Dummy candlestick data (15-min intervals)
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
        const gasEth = ((baseFee + priorityFee) * 21000) / 1e9;
        const gasUSD = (gasEth * usdPrice).toFixed(2);
        const walletBalance = 1.2;
        const txEth = parseFloat(inputEth || "0");
        const totalEth = gasEth + txEth;
        const remainingEth = walletBalance - totalEth;

        return (
          <div key={chain} className="my-6 p-4 border rounded shadow bg-white">
            <p className="font-semibold text-lg mb-2">
              🔗 {chain.charAt(0).toUpperCase() + chain.slice(1)}
            </p>

            <p>📦 Base Fee: <strong>{baseFee.toFixed(3)}</strong> gwei</p>
            <p>⚡ Priority Fee: <strong>{priorityFee}</strong> gwei</p>
            <p>💰 ETH/USD: <strong>${usdPrice.toFixed(2)}</strong></p>
            <p>💸 Gas Cost: <strong>{gasEth.toFixed(6)}</strong> ETH (~${gasUSD})</p>

            {/* Wallet Simulation Section */}
            <div className="mt-4 bg-gray-100 p-3 rounded">
              <p className="font-semibold text-gray-700 mb-1">🧪 Wallet Simulation</p>
              <p>Wallet Balance: <strong>{walletBalance}</strong> ETH</p>
              <p>Transaction Value: <strong>{txEth}</strong> ETH</p>
              <p>Total Deducted (TX + Gas): <strong>{totalEth.toFixed(6)}</strong> ETH</p>
              <p className={remainingEth >= 0 ? "text-green-600" : "text-red-600"}>
                Remaining Balance: <strong>{remainingEth.toFixed(6)}</strong> ETH
              </p>
            </div>
          </div>
        );
      })}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        onClick={() => setMode(mode === "live" ? "simulation" : "live")}
      >
        Switch to {mode === "live" ? "Simulation" : "Live"} Mode
      </button>

      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">15-Min Candlestick Chart (Dummy)</h2>
        <CandlestickChart data={dummyChartData} />
      </div>
    </main>
  );
}
