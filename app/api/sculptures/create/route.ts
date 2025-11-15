import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    console.log("[v0] API: Starting sculpture creation...")
    
    const body = await request.json()
    const { name, description, curiosity, image_url, sculpture_number } = body

    console.log("[v0] API: Sculpture data received:", { name, description, curiosity, sculpture_number, hasImage: !!image_url })

    if (!name || !description) {
      console.log("[v0] API: Validation failed - missing required fields")
      return NextResponse.json({ success: false, error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the next code number
    const { data: existingSculptures } = await supabase
      .from("sculptures")
      .select("code")
      .order("code", { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (existingSculptures && existingSculptures.length > 0) {
      const lastCode = existingSculptures[0].code
      nextNumber = (typeof lastCode === "number" ? lastCode : 0) + 1
    }

    console.log("[v0] API: Next sculpture code:", nextNumber)

    const { data, error } = await supabase
      .from("sculptures")
      .insert({
        code: nextNumber,
        name,
        description,
        curiosity: curiosity || null,
        image_url: image_url || null,
        sculpture_number: sculpture_number || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] API: Database error creating sculpture:", error)
      return NextResponse.json({ success: false, error: "Erro ao criar escultura: " + error.message }, { status: 500 })
    }

    console.log("[v0] API: Sculpture created successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error in sculptures/create:", error)
    return NextResponse.json({ success: false, error: error.message || "Erro ao criar escultura" }, { status: 500 })
  }
}
