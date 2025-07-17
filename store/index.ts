// store/index.ts
import { create } from 'zustand';

type ChainData = {
  baseFee: number;
  priorityFee: number;
  history: { timestamp: number; price: number }[];
};

type StoreState = {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainData;
  };
  usdPrice: number;
  setGasData: (gas: Partial<ChainData>) => void;
  setUsdPrice: (price: number) => void;
  setMode: (mode: 'live' | 'simulation') => void;
};

export const useStore = create<StoreState>((set) => ({
  mode: 'live',
  chains: {
    ethereum: {
      baseFee: 0,
      priorityFee: 2,
      history: [],
    },
  },
  usdPrice: 0,
  setGasData: (gas) =>
    set((state) => ({
      chains: {
        ethereum: {
          ...state.chains.ethereum,
          ...gas,
        },
      },
    })),
  setUsdPrice: (price) => set(() => ({ usdPrice: price })),
  setMode: (mode) => set(() => ({ mode })),
}));
