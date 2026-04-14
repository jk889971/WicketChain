// ============================================================
// BaseIndexer — HTTP Polling indexer
// One indexer per contract, uses eth_getLogs polling
// Idempotent upserts keyed on (chain_id, tx_hash, log_index)
// ============================================================

import { ethers, JsonRpcProvider, Contract } from "ethers";
import {
  CHAIN_ID,
  HTTP_RPC_URL,
  GAP_RECOVERY_BLOCK_RANGE,
} from "../config.js";
import { supabase } from "../supabase.js";

export interface LogMeta {
  chainId: number;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockTimestamp?: number;
}

export interface ParsedEventData {
  transactionHash: string;
  index: number;
  blockNumber: number;
  eventName: string;
  args: ethers.Result;
}

const POLL_INTERVAL_MS = 2000;

export abstract class BaseIndexer {
  readonly name: string;
  readonly address: string;
  readonly abi: readonly string[];

  private httpProvider: JsonRpcProvider;
  private lastProcessedBlock: number = 0;
  private isShuttingDown: boolean = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isRecovering: boolean = false;

  constructor(name: string, address: string, abi: readonly string[]) {
    this.name = name;
    this.address = address;
    this.abi = abi;
    this.httpProvider = new JsonRpcProvider(HTTP_RPC_URL);
  }

  // ── Subclasses implement this to handle each event ──
  abstract handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void>;

  // ── Public API ──

  async start(): Promise<void> {
    this.log("Starting indexer...");

    // ── Load last processed block from DB (survives process restarts) ──
    const { data, error: loadError } = await supabase
      .from("indexer_state")
      .select("last_processed_block")
      .eq("indexer_name", this.name)
      .single();

    if (loadError) {
      this.log(`Could not load persisted state (${loadError.message}), falling back to current block`);
      try {
        this.lastProcessedBlock = await this.httpProvider.getBlockNumber();
      } catch {
        this.lastProcessedBlock = 0;
      }
    } else if (data && Number(data.last_processed_block) > 0) {
      this.lastProcessedBlock = Number(data.last_processed_block);
      this.log(`Resuming from persisted block ${this.lastProcessedBlock}`);
    } else {
      // First run ever — start from the current chain tip
      try {
        this.lastProcessedBlock = await this.httpProvider.getBlockNumber();
      } catch {
        this.lastProcessedBlock = 0;
      }
      this.log(`No persisted state — starting from current block ${this.lastProcessedBlock}`);
      await this.persistLastProcessedBlock();
    }

    await this.connect();
  }

  async stop(): Promise<void> {
    this.isShuttingDown = true;
    this.log("Stopping indexer...");
    await this.disconnect();
  }

  // ── Connection management ──

  private async connect(): Promise<void> {
    if (this.isShuttingDown) return;

    this.log(`Starting HTTP polling with interval ${POLL_INTERVAL_MS}ms`);

    // Initial gap recovery to catch up immediately
    await this.recoverGap();

    // Start periodic polling
    this.pollTimer = setInterval(async () => {
      if (!this.isShuttingDown) {
        await this.recoverGap();
      }
    }, POLL_INTERVAL_MS);
  }

  private async disconnect(): Promise<void> {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // ── Persist the current lastProcessedBlock to Supabase ──
  private async persistLastProcessedBlock(): Promise<void> {
    const { error } = await supabase.from("indexer_state").upsert(
      {
        indexer_name: this.name,
        last_processed_block: this.lastProcessedBlock,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "indexer_name" }
    );
    if (error) {
      this.log(`Warning: could not persist block state: ${error.message}`);
    }
  }

  // ── Gap recovery via eth_getLogs ──

  private async recoverGap(): Promise<void> {
    if (this.isRecovering) return;
    this.isRecovering = true;

    try {
      if (this.lastProcessedBlock === 0) return;

      const currentBlock = await this.httpProvider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock + 1;

      if (fromBlock > currentBlock) {
        // Already at chain tip
        return;
      }

      this.log(`Syncing: blocks ${fromBlock} → ${currentBlock}`);

    // Use HTTP provider with Contract for getLogs
    const httpContract = new Contract(this.address, this.abi, this.httpProvider);

    // Process in chunks to stay within eth_getLogs limits
    let gapComplete = true;
    for (let start = fromBlock; start <= currentBlock; start += GAP_RECOVERY_BLOCK_RANGE) {
      const end = Math.min(start + GAP_RECOVERY_BLOCK_RANGE - 1, currentBlock);

      let chunkOk = true;
      try {
        const events = await httpContract.queryFilter("*", start, end);
        for (const event of events) {
          let eventName = (event as any).eventName;
          let args = (event as any).args;

          if (!eventName && event.topics && event.data) {
             try {
               const parsed = httpContract.interface.parseLog({ topics: event.topics as string[], data: event.data });
               if (parsed) {
                 eventName = parsed.name;
                 args = parsed.args;
               }
             } catch {}
          }

          if (eventName && args) {
             const ok = await this.processLog({
                 transactionHash: event.transactionHash,
                 index: event.index,
                 blockNumber: event.blockNumber,
                 eventName,
                 args
             });
             if (!ok) chunkOk = false;
          }
        }
      } catch (err: any) {
        this.log(`Gap recovery error (blocks ${start}-${end}): ${err.message}`);
        chunkOk = false;
      }

      if (chunkOk) {
        // Persist progress after each successful chunk so a mid-recovery crash
        // doesn't force a full re-scan from the beginning next restart
        this.lastProcessedBlock = end;
        await this.persistLastProcessedBlock();
      } else {
        this.log(`Warning: blocks ${start}-${end} had failures — cursor not advanced, will retry on next restart`);
        gapComplete = false;
        break;
      }
    }

    if (gapComplete) {
      this.lastProcessedBlock = currentBlock;
    } else {
      this.log(`Sync incomplete. Resuming from block ${this.lastProcessedBlock + 1} next cycle`);
    }
    } finally {
      this.isRecovering = false;
    }
  }

  // ── Process a single log ──

  private async processLog(log: ParsedEventData): Promise<boolean> {
    const meta: LogMeta = {
      chainId: CHAIN_ID,
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
    };

    try {
      await this.handleEvent(log.eventName, log.args, meta);
      this.log(`Processed: ${log.eventName} (tx: ${meta.txHash.slice(0, 10)}... block: ${meta.blockNumber})`);
      // Advance cursor only after the event is successfully written to DB.
      // Persist so that if the process dies, the next restart resumes from here.
      if (log.blockNumber > this.lastProcessedBlock) {
        this.lastProcessedBlock = log.blockNumber;
        await this.persistLastProcessedBlock();
      }
      return true;
    } catch (err: any) {
      this.log(`FAILED to process ${log.eventName}: ${err.message} (tx: ${meta.txHash})`);
      return false;
    }
  }

  // ── Logging ──

  protected log(msg: string): void {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${this.name}] ${msg}`);
  }
}
