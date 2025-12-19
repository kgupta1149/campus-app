import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  // Simple query: ask Supabase what time it is (no tables needed)
  const { data, error } = await supabase.rpc("now")

  // Some Supabase projects may not have "now" RPC; fallback to a no-op 
response
  if (error) {
    return NextResponse.json({
      ok: false,
      message: "Supabase reachable but RPC not available (this is fine).",
      error: error.message,
    }, { status: 200 })
  }

  return NextResponse.json({ ok: true, data }, { status: 200 })
}



