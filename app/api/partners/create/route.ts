import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.json()
    const { name, organization, phone, email } = body

    if (!name || !organization) {
      return NextResponse.json({ error: "Nome e organização são obrigatórios" }, { status: 400 })
    }

    // Insert partner
    const { data, error } = await supabase
      .from("partners")
      .insert({
        name,
        organization,
        phone: phone || null,
        email: email || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating partner:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Partner created successfully:", data)
    return NextResponse.json({ partner: data })
  } catch (error: any) {
    console.error("[v0] Error in create partner API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
