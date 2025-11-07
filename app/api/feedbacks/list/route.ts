import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase
      .from("satisfaction_ratings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading feedbacks:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Loaded feedbacks:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Error in feedbacks API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
