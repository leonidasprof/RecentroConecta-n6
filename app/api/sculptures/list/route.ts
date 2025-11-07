import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase.from("sculptures").select("*").order("code", { ascending: true })

    if (error) throw error

    console.log("[v0] API: Loaded sculptures:", data)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] API: Error loading sculptures:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
