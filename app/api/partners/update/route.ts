import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.json()
    const { id, name, organization, phone, email } = body

    if (!id || !name || !organization) {
      return NextResponse.json({ error: "ID, nome e organização são obrigatórios" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("partners")
      .update({
        name,
        organization,
        phone: phone || null,
        email: email || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating partner:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Partner updated successfully:", data)
    return NextResponse.json({ partner: data })
  } catch (error: any) {
    console.error("[v0] Error in update partner API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
