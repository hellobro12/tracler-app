# ⛽ Real-Time Cross-Chain Gas Price Tracker (MVP)

This is a real-time gas fee tracker built for Ethereum, Polygon, and Arbitrum networks. It shows live gas prices and simulates wallet deductions with ETH to USD conversion.

> 🛠️ Built as part of a beginner-level assignment to practice real-time WebSocket data, Ethereum dev tools, and charting.

---

## ✅ Features Implemented

### 🔴 Real-Time Gas Fees (via WebSockets)
- Gas data fetched live for **Ethereum, Polygon, and Arbitrum** using **Infura** and **Alchemy WebSockets**.
- Shows **Base Fee** and **Priority Fee**.

### 💸 ETH to USD Conversion
- ETH/USD price fetched using **CoinGecko** API.
- Used to estimate **USD cost per gas**.

### 🧪 Wallet Simulation
- Simple simulation shows:
  - Wallet balance
  - Gas + TX cost deduction
  - Remaining balance after transaction

### 📊 Candlestick Chart (Dummy)
- A **15-minute candlestick chart** placeholder using `lightweight-charts`.
- Currently uses **dummy data** to visualize price movement.
- Plan was to use **Uniswap V3 swaps** for real chart but couldn’t complete due to time limits.

---

## ❌ Not Implemented (Due to Time Constraints)
- Real Candlestick Chart from **Uniswap V3 Swap events**
- Chart aggregation into real OHLC candles
- Transaction simulation with slippage/gas estimation
- Error handling and UI improvements

---

## 💻 Tech Stack

- `Next.js`, `TypeScript`, `TailwindCSS`
- `ethers.js` for blockchain interactions
- `lightweight-charts` for price chart
- `Zustand` for state management

---

## 🧠 Learning Goals

- Use real-time WebSockets from Ethereum nodes
- Simulate gas fee calculations
- Handle multi-chain data
- Display price/fee visually in charts

---

## 🚀 How to Run

1. Install dependencies:
   ```bash
   npm install
2. Add your API keys in `index.tsx`:
```ts
const RPC_URLS = {
  ethereum: "wss://mainnet.infura.io/ws/v3/YOUR_INFURA_KEY",
  polygon: "wss://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
  arbitrum: "wss://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
};

3 .Start the app:

npm run dev

4.Open this in your browser:


Copy code
http://localhost:3000