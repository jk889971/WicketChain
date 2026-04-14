import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { activeChain } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "WicketChain",
  projectId: "wicketchain-dapp", // WalletConnect project ID — replace with real one for prod
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
  },
  ssr: true,
});
