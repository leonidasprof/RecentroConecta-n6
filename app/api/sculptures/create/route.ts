import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, curiosity, image_url } = body

    if (!name || !description) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
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

    const { data, error } = await supabase
      .from("sculptures")
      .insert({
        code: nextNumber,
        name,
        description,
        curiosity: curiosity || null,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating sculpture:", error)
      return NextResponse.json({ error: "Erro ao criar escultura: " + error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error in sculptures/create API:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar escultura" }, { status: 500 })
  }
}
