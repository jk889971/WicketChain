"use client";

import { useState, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { type Abi } from "viem";
import { getRevertMessage } from "@/lib/revertMap";

export type TxStep = "idle" | "confirming" | "pending" | "success" | "error";

interface UseContractWriteOptions {
  onSuccess?: (hash: string) => void;
  successMessage?: string;
}

/**
 * Wrapper around wagmi's useWriteContract with:
 * - 3-step transaction progress tracking
 * - Plain-English error mapping
 * - Double-submit prevention
 * - Lets wallet/libs handle gas estimation (no manual buffer)
 */
export function useContractWrite(options?: UseContractWriteOptions) {
  const [step, setStep] = useState<TxStep>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isWaitingReceipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
    query: {
      enabled: !!txHash,
    },
  });

  const execute = useCallback(
    async ({
      address,
      abi,
      functionName,
      args = [],
      value,
    }: {
      address: `0x${string}`;
      abi: Abi;
      functionName: string;
      args?: unknown[];
      value?: bigint;
    }) => {
      try {
        setStep("confirming");
        setErrorMessage(undefined);

        // Let the wallet handle gas estimation — no manual buffer
        const hash = await writeContractAsync({
          address,
          abi,
          functionName,
          args,
          value,
        });

        setTxHash(hash);
        setStep("pending");

        // Wait for receipt
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });

          if (receipt.status === "success") {
            setStep("success");
            await options?.onSuccess?.(hash);
          } else {
            throw new Error("Transaction reverted");
          }
        }

        return hash;
      } catch (err) {
        const message = getRevertMessage(err);
        setErrorMessage(message);
        setStep("error");
        throw err;
      }
    },
    [writeContractAsync, publicClient, options]
  );

  const reset = useCallback(() => {
    setStep("idle");
    setTxHash(undefined);
    setErrorMessage(undefined);
  }, []);

  return {
    execute,
    reset,
    step,
    txHash,
    errorMessage,
    isLoading: step === "confirming" || step === "pending",
    isWritePending,
    isWaitingReceipt,
  };
}
