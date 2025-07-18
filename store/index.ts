import { create } from "zustand";

export type Chain = "ethereum" | "polygon" | "arbitrum";

export interface ChainData {
  baseFee: number;
  priorityFee: number;
}

interface GasStore {
  mode: "live" | "simulation";
  usdPrice: number;
  chains: Record<Chain, ChainData>;
  setGasData: (chain: Chain, data: ChainData) => void;
  setUsdPrice: (price: number) => void;
  setMode: (mode: "live" | "simulation") => void;
}

export const useStore = create<GasStore>((set) => ({
  mode: "live",
  usdPrice: 0,
  chains: {
    ethereum: { baseFee: 0, priorityFee: 2 },
    polygon: { baseFee: 0, priorityFee: 2 },
    arbitrum: { baseFee: 0, priorityFee: 2 },
  },
  setGasData: (chain, data) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          baseFee: data.baseFee,
          priorityFee: data.priorityFee,
        },
      },
    })),
  setUsdPrice: (price) => set(() => ({ usdPrice: price })),
  setMode: (mode) => set(() => ({ mode })),
}));
