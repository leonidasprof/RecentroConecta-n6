import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId } = body

    console.log("[v0] API: Resetting password for employee:", employeeId)

    if (!employeeId) {
      return NextResponse.json({ error: "ID do funcionário é obrigatório" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate new temporary password
    const newTempPassword = `temp${Math.random().toString(36).slice(-6)}`
    console.log("[v0] API: Generated new temp password:", newTempPassword)

    // Update employee password
    const { data, error } = await supabase
      .from("employees")
      .update({
        password_hash: newTempPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId)
      .select()
      .single()

    if (error) {
      console.error("[v0] API: Error resetting password:", error)
      return NextResponse.json({ error: "Erro ao resetar senha: " + error.message }, { status: 500 })
    }

    console.log("[v0] API: Password reset successfully for:", data)

    return NextResponse.json({
      success: true,
      employee: data,
      newTempPassword,
    })
  } catch (error) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Erro inesperado ao resetar senha" }, { status: 500 })
  }
}
