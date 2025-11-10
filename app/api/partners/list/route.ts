import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.from("partners").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading partners:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Loaded partners:", data)
    return NextResponse.json({ partners: data })
  } catch (error: any) {
    console.error("[v0] Error in partners list API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
