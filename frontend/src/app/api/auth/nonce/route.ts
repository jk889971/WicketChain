import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key to forcefully bypass RLS and insert nonces securely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Generate a cryptographically secure 32-character hex nonce (128-bit entropy)
    const nonce = randomBytes(16).toString("hex");

    // Store in Supabase auth_nonces table (which is restricted to service_role)
    const { error } = await supabase.from("auth_nonces").insert({
      nonce,
      wallet_address: address.toLowerCase(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create nonce" }, { status: 500 });
    }

    return NextResponse.json({ nonce });
  } catch (err: any) {
    console.error("Nonce generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
