import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyMessage } from "viem";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase();

export async function POST(request: Request) {
  try {
    const { address, message, signature, nonce } = await request.json();

    if (!address || !message || !signature || !nonce) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Check if the nonce exists and is assigned to this address
    const { data: nonceData, error: nonceError } = await supabase
      .from("auth_nonces")
      .select("*")
      .eq("nonce", nonce)
      .eq("wallet_address", address.toLowerCase())
      .single();

    if (nonceError || !nonceData) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
    }

    // 2. Verify the crypto signature cleanly via Viem
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Delete the nonce to prevent replay attacks
    await supabase.from("auth_nonces").delete().eq("nonce", nonce);

    // 4. Mint a custom Supabase JWT
    const payload = {
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      sub: address.toLowerCase(),
      role: "authenticated",
      wallet_address: address.toLowerCase(),
      is_admin: address.toLowerCase() === ADMIN_WALLET
    };

    // IMPORTANT: Use the exact string as configured in Supabase, even if it looks like base64.
    const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });

    return NextResponse.json({ access_token: token });

  } catch (error: any) {
    console.error("SIWE Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
