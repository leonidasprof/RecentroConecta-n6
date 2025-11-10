import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, newPassword } = body

    console.log("[v0] API: Updating password for employee:", employeeId)

    if (!employeeId || !newPassword) {
      return NextResponse.json({ error: "ID do funcionário e nova senha são obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 6 caracteres" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] API: Updating password to:", newPassword)

    // Update employee password
    const { data, error } = await supabase
      .from("employees")
      .update({
        password_hash: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId)
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] API: Error updating password:", error)
      return NextResponse.json({ error: "Erro ao atualizar senha: " + error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    console.log("[v0] API: Password updated successfully for:", data)

    return NextResponse.json({
      success: true,
      employee: data,
    })
  } catch (error) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Erro inesperado ao atualizar senha" }, { status: 500 })
  }
}
