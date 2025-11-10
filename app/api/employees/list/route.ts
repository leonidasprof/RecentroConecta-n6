import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] API: Error loading employees:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Loaded employees:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] API: Error loading employees:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
