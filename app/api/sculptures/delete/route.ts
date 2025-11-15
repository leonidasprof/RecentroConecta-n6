import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID da escultura é obrigatório" }, { status: 400 })
    }

    console.log("[v0] API: Deleting sculpture:", id)

    const { error } = await supabase.from("sculptures").delete().eq("id", id)

    if (error) {
      console.error("[v0] API: Error deleting sculpture:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Sculpture deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] API: Error in delete sculpture:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
