import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do parceiro é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase.from("partners").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting partner:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Partner deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in delete partner API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
