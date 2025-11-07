import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role } = body

    console.log("[v0] API: Creating employee:", { name, email, role })

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nome, email e função são obrigatórios" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if email already exists
    const { data: existingEmployee } = await supabase.from("employees").select("email").eq("email", email).maybeSingle()

    if (existingEmployee) {
      console.log("[v0] API: Email already exists:", email)
      return NextResponse.json({ error: "Este email já está cadastrado no sistema" }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = `temp${Math.random().toString(36).slice(-6)}`
    console.log("[v0] API: Generated temp password:", tempPassword)

    // Insert new employee
    const { data, error } = await supabase
      .from("employees")
      .insert({
        name,
        email,
        role,
        password_hash: tempPassword,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] API: Error creating employee:", error)
      return NextResponse.json({ error: "Erro ao criar funcionário: " + error.message }, { status: 500 })
    }

    console.log("[v0] API: Employee created successfully:", data)

    return NextResponse.json({
      success: true,
      employee: data,
      tempPassword,
    })
  } catch (error) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Erro inesperado ao criar funcionário" }, { status: 500 })
  }
}
