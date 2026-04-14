"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { supabase } from "@/lib/supabase";

export function SupabaseSIWEProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, status } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const authenticatingAddress = useRef<string | null>(null);
  // Track whether we've ever been "connected" this session
  const wasConnected = useRef<boolean>(false);

  useEffect(() => {
    async function authenticate() {
      // 1. Skip while wagmi is still reconnecting from its persisted cache
      if (status === "connecting" || status === "reconnecting") return;

      // 2. Handle disconnection:
      //    ONLY clear our token if we were previously connected (user explicitly disconnected)
      //    Do NOT clear on initial page load where status briefly shows "disconnected"
      if (status === "disconnected") {
        if (wasConnected.current) {
          // Genuine disconnect — wipe the session
          console.log("SIWE: User disconnected, clearing session.");
          localStorage.removeItem("siwe_token");
          localStorage.removeItem("siwe_address");
          supabase.realtime.setAuth(null as any);
          wasConnected.current = false;
        }
        return;
      }

      // From here on, wallet is connected
      if (!address || !isConnected) return;
      wasConnected.current = true;

      // Prevent redundant auth cycles for the same address
      if (authenticatingAddress.current === address) return;

      const storedAddress = localStorage.getItem("siwe_address");
      const storedToken = localStorage.getItem("siwe_token");

      // 3. Restore from cache (this handles page reloads)
      if (storedAddress === address.toLowerCase() && storedToken) {
        console.log("SIWE: Session restored from cache for", storedAddress);
        supabase.realtime.setAuth(storedToken);
        return;
        // NOTE: REST calls are handled by the fetch interceptor in supabase.ts
      }

      // 4. No valid cache — request a fresh signature
      authenticatingAddress.current = address;
      try {
        console.log("SIWE: Requesting fresh signature for", address);

        const nonceRes = await fetch("/api/auth/nonce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        const { nonce } = await nonceRes.json();
        if (!nonce) throw new Error("No nonce received from server");

        const message = `Sign in to WicketChain with your wallet.\n\nNonce: ${nonce}`;
        const signature = await signMessageAsync({ message });

        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, message, signature, nonce }),
        });

        const { access_token, error: verifyError } = await verifyRes.json();
        if (verifyError) throw new Error(verifyError);

        if (access_token) {
          supabase.realtime.setAuth(access_token);
          localStorage.setItem("siwe_address", address.toLowerCase());
          localStorage.setItem("siwe_token", access_token);
          console.log("SIWE: New session established.");
        }
      } catch (err) {
        console.error("SIWE: Authentication failed:", err);
      } finally {
        authenticatingAddress.current = null;
      }
    }

    authenticate();
  }, [address, isConnected, status, signMessageAsync]);

  return <>{children}</>;
}
