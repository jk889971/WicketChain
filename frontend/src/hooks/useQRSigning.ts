"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSignMessage } from "wagmi";

export const SESSION_DURATION = 1800; // 30 minutes — wallet signs once per session
export const QR_DURATION      = 60;  // 1 minute — QR rotates silently within session

export interface QRTicket {
  tokenId: number;
  rowLabel: string;
  seatNumber: number;
  enclosureName: string;
}

interface Session {
  sig:   string;
  start: number;
  end:   number;
}

export interface UseQRSigningResult {
  /** Full verify URL to render as QR — null while unsigned or between rotations */
  qrUrl: string | null;
  /** Seconds until this QR rotates (counts 60 → 0) */
  qrSecondsLeft: number;
  /** True while waiting for wallet signature */
  isSigning: boolean;
  /** Whether a valid session + QR currently exists */
  hasSigned: boolean;
  /** Error string if wallet rejected */
  signingError: string | null;
  /** Start (or restart) a session — prompts wallet once */
  sign: () => void;
}

/**
 * Session-based QR signing.
 *
 * The wallet is prompted ONCE per session (every 2 minutes).
 * Within the session, QR codes rotate every 60s automatically — no wallet prompt.
 *
 * Session message (EIP-191 personal_sign):
 *   Single: "WicketChain Session | TokenID: 42 | SessionStart: T | SessionEnd: T+120"
 *   Batch:  "WicketChain Session | TokenIDs: 10,11 | SessionStart: T | SessionEnd: T+120"
 *
 * QR URL:
 *   /verify?ids=10,11&sessionStart=T&sessionEnd=T+120&ts=<rotationTimestamp>&sig=0x...
 */
export function useQRSigning(tickets: QRTicket[]): UseQRSigningResult {
  const [qrUrl, setQrUrl]               = useState<string | null>(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(QR_DURATION);
  const [hasSigned, setHasSigned]       = useState(false);
  const [isSigning, setIsSigning]       = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  const { signMessageAsync } = useSignMessage();

  // ── Refs (stable across renders, safe inside intervals) ──────────────────
  const sessionRef      = useRef<Session | null>(null);
  const ticketsRef      = useRef(tickets);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef      = useRef(0);  // seconds elapsed since session started
  const signFnRef       = useRef<() => void>(() => {});
  const dappUrl         = typeof window !== "undefined" ? window.location.origin : "";

  ticketsRef.current = tickets; // always up-to-date in callbacks

  // ── Build QR URL from current session + a given rotation timestamp ────────
  const buildQrUrl = useCallback((session: Session, rotationTs: number): string => {
    const ids = ticketsRef.current.map((t) => t.tokenId).join(",");
    return (
      `${dappUrl}/verify` +
      `?ids=${ids}` +
      `&sessionStart=${session.start}` +
      `&sessionEnd=${session.end}` +
      `&ts=${rotationTs}` +
      `&sig=${encodeURIComponent(session.sig)}`
    );
  }, [dappUrl]);

  // ── Start the interval that drives QR rotation + session expiry ───────────
  const startTimer = useCallback((session: Session) => {
    if (timerRef.current) clearInterval(timerRef.current);
    elapsedRef.current = 0;
    setQrSecondsLeft(QR_DURATION);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const withinQr = QR_DURATION - (elapsedRef.current % QR_DURATION);
      setQrSecondsLeft(withinQr === QR_DURATION ? QR_DURATION : withinQr);

      // QR rotation point
      if (elapsedRef.current % QR_DURATION === 0) {
        if (elapsedRef.current >= SESSION_DURATION) {
          // ── Session expired — clear and auto re-sign ──
          clearInterval(timerRef.current!);
          timerRef.current = null;
          sessionRef.current = null;
          setQrUrl(null);
          setHasSigned(false);
          setQrSecondsLeft(QR_DURATION);
          elapsedRef.current = 0;
          // Trigger new session automatically
          signFnRef.current();
        } else {
          // ── Silent rotation — new ts, same session sig ──
          const rotationTs = Math.floor(Date.now() / 1000);
          setQrUrl(buildQrUrl(session, rotationTs));
          setQrSecondsLeft(QR_DURATION);
        }
      }
    }, 1000);
  }, [buildQrUrl]);

  // ── Core sign function — prompts wallet once, starts session ──────────────
  const sign = useCallback(async () => {
    const ids = ticketsRef.current.map((t) => t.tokenId);
    if (ids.length === 0) return;

    setSigningError(null);
    setIsSigning(true);

    const start   = Math.floor(Date.now() / 1000);
    const end     = start + SESSION_DURATION;
    const idsPart = ids.length > 1 ? `TokenIDs: ${ids.join(",")}` : `TokenID: ${ids[0]}`;
    const message = `WicketChain Session | ${idsPart} | SessionStart: ${start} | SessionEnd: ${end}`;

    try {
      const sig = await signMessageAsync({ message });

      const session: Session = { sig, start, end };
      sessionRef.current = session;

      // Generate first QR immediately
      setQrUrl(buildQrUrl(session, start));
      setHasSigned(true);
      setIsSigning(false);

      // Start rotation + session expiry timer
      startTimer(session);
    } catch (err: unknown) {
      setIsSigning(false);
      const rejected =
        err instanceof Error &&
        (err.message.includes("User rejected") || err.message.includes("denied"));
      setSigningError(
        rejected
          ? "Signature rejected. Tap the button to try again."
          : "Signing failed. Please try again."
      );
    }
  }, [signMessageAsync, buildQrUrl, startTimer]);

  // Keep signFnRef current so the timer can call the latest sign()
  signFnRef.current = sign;

  // ── Invalidate session when ticket selection changes ──────────────────────
  const prevIdsKey = useRef("");
  const currentIdsKey = tickets.map((t) => t.tokenId).sort().join(",");

  useEffect(() => {
    if (prevIdsKey.current !== "" && prevIdsKey.current !== currentIdsKey) {
      if (timerRef.current) clearInterval(timerRef.current);
      sessionRef.current = null;
      setQrUrl(null);
      setHasSigned(false);
      setQrSecondsLeft(QR_DURATION);
      elapsedRef.current = 0;
    }
    prevIdsKey.current = currentIdsKey;
  }, [currentIdsKey]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { qrUrl, qrSecondsLeft, isSigning, hasSigned, signingError, sign };
}
