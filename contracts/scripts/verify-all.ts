/**
 * Verify all deployed WicketChain contracts on Blockscout v2 API (Hardhat v3)
 *
 * Uses Blockscout's /api/v2/smart-contracts/{address}/verification/via/standard-input
 *
 * Usage:
 *   npx hardhat run scripts/verify-all.ts --network wirefluidTestnet
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOCKSCOUT_URL = "https://wirefluidscan.com";
const BUILD_INFO_FILE = "solc-0_8_33-dbd5a66d2cb691d44e0ee0f4a3f0e48b1db1312b.json";

interface ContractInfo {
  name: string;
  address: string;
  sourcePath: string; // e.g. "project/contracts/core/WicketChainVault.sol"
}

async function verifyContract(info: ContractInfo, standardInput: string, compilerVersion: string) {
  const url = `${BLOCKSCOUT_URL}/api/v2/smart-contracts/${info.address}/verification/via/standard-input`;
  console.log(`\nVerifying ${info.name} at ${info.address}...`);

  // Build multipart form data manually
  const boundary = "----WicketChainVerify" + Date.now();
  const contractName = `${info.sourcePath}:${info.name}`;

  const parts: string[] = [];

  // compiler_version
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="compiler_version"\r\n\r\nv${compilerVersion}`);

  // contract_name (fully qualified: path:ContractName)
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="contract_name"\r\n\r\n${contractName}`);

  // license_type
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="license_type"\r\n\r\nmit`);

  // autodetect_constructor_args
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="autodetect_constructor_args"\r\n\r\ntrue`);

  // files[0] - the standard JSON input
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="files[0]"; filename="input.json"\r\nContent-Type: application/json\r\n\r\n${standardInput}`);

  const body = parts.join("\r\n") + `\r\n--${boundary}--\r\n`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    if (response.ok) {
      const text = await response.text();
      if (text) {
        const json = JSON.parse(text);
        if (json.message) {
          console.log(`  ${info.name}: ${json.message}`);
        } else {
          console.log(`  ${info.name} verified successfully!`);
        }
      } else {
        console.log(`  ${info.name} verified successfully! (no content)`);
      }
    } else {
      const errText = await response.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errText;
      } catch {}
      console.error(`  Failed (${response.status}): ${errMsg}`);
    }
  } catch (error) {
    console.error(`  Network error: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  const userProfileAddr = process.env.USER_PROFILE_ADDRESS;
  const venueRegistryAddr = process.env.VENUE_REGISTRY_ADDRESS;
  const vaultAddr = process.env.VAULT_ADDRESS;
  const ticketNFTAddr = process.env.TICKET_NFT_ADDRESS;
  const stadiumShopAddr = process.env.STADIUM_SHOP_ADDRESS;

  if (!userProfileAddr || !venueRegistryAddr || !vaultAddr || !ticketNFTAddr || !stadiumShopAddr) {
    console.error("ERROR: Set all contract addresses in .env");
    process.exit(1);
  }

  // Load build info
  const buildInfoPath = path.join(__dirname, "..", "artifacts", "build-info", BUILD_INFO_FILE);
  if (!fs.existsSync(buildInfoPath)) {
    console.error(`ERROR: Build info not found at ${buildInfoPath}`);
    console.error("Run 'npx hardhat compile' first.");
    process.exit(1);
  }

  console.log("Loading build info...");
  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf-8"));
  const compilerVersion = buildInfo.solcLongVersion; // "0.8.33+commit.64118f21"
  const standardInput = JSON.stringify(buildInfo.input);

  console.log(`Compiler: v${compilerVersion}`);
  console.log(`Sources: ${Object.keys(buildInfo.input.sources).length} files`);

  const contracts: ContractInfo[] = [
    {
      name: "UserProfile",
      address: userProfileAddr,
      sourcePath: "project/contracts/profile/UserProfile.sol",
    },
    {
      name: "VenueRegistry",
      address: venueRegistryAddr,
      sourcePath: "project/contracts/core/VenueRegistry.sol",
    },
    {
      name: "WicketChainVault",
      address: vaultAddr,
      sourcePath: "project/contracts/core/WicketChainVault.sol",
    },
    {
      name: "TicketNFT",
      address: ticketNFTAddr,
      sourcePath: "project/contracts/core/TicketNFT.sol",
    },
    {
      name: "StadiumShop",
      address: stadiumShopAddr,
      sourcePath: "project/contracts/core/StadiumShop.sol",
    },
  ];

  console.log("\n=== Verifying WicketChain Contracts on Blockscout ===");

  for (const contract of contracts) {
    await verifyContract(contract, standardInput, compilerVersion);
  }

  console.log("\n=== Verification complete! ===");
  console.log(`View on explorer: ${BLOCKSCOUT_URL}`);
  console.log("\nContract links:");
  for (const c of contracts) {
    console.log(`  ${c.name}: ${BLOCKSCOUT_URL}/address/${c.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
