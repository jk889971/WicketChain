import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { TicketNFTABI } from "./src/config/abis/TicketNFT";
import { StadiumShopABI } from "./src/config/abis/StadiumShop";
import { WicketChainVaultABI } from "./src/config/abis/WicketChainVault";
import { VenueRegistryABI } from "./src/config/abis/VenueRegistry";
import { UserProfileABI } from "./src/config/abis/UserProfile";

export default defineConfig({
  out: "src/lib/contracts/generated.ts",
  contracts: [
    {
      name: "TicketNFT",
      abi: TicketNFTABI,
    },
    {
      name: "StadiumShop",
      abi: StadiumShopABI,
    },
    {
      name: "WicketChainVault",
      abi: WicketChainVaultABI,
    },
    {
      name: "VenueRegistry",
      abi: VenueRegistryABI,
    },
    {
      name: "UserProfile",
      abi: UserProfileABI,
    },
  ],
  plugins: [react()],
});
