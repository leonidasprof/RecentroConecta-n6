import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const { id, name, description, curiosity, image_url } = await request.json()

    if (!id || !name) {
      return NextResponse.json({ error: "ID e nome são obrigatórios" }, { status: 400 })
    }

    // Create service role client to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase
      .from("sculptures")
      .update({
        name,
        description,
        curiosity,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating sculpture:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
