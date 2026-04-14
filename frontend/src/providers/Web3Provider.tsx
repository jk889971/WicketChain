"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { SupabaseSIWEProvider } from "./SupabaseSIWEProvider";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const rainbowTheme = darkTheme({
  accentColor: "#56a963",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme} modalSize="compact">
          <SupabaseSIWEProvider>
            {children}
          </SupabaseSIWEProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
