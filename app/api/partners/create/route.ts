import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] API: Starting partner creation...")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { name, organization, phone, email } = body

    console.log("[v0] API: Partner data received:", { name, organization, phone, email })

    if (!name || !organization) {
      console.log("[v0] API: Validation failed - missing required fields")
      return NextResponse.json({ success: false, error: "Nome e organização são obrigatórios" }, { status: 400 })
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
      console.error("[v0] API: Database error creating partner:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Partner created successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error in create partner:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
