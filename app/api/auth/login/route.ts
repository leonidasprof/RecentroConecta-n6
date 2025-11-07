import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    if (email === "admin" && password === "admin") {
      console.log("[v0] Admin login successful")
      return NextResponse.json({
        success: true,
        employee: {
          id: 1,
          name: "Administrador",
          email: "admin",
          role: "admin",
        },
      })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { data: employee, error } = await supabase.from("employees").select("*").eq("email", email).single()

    if (error || !employee) {
      console.log("[v0] Employee not found:", error)
      return NextResponse.json({ error: "Email ou senha inválidos", success: false }, { status: 401 })
    }

    if (employee.password_hash !== password) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Email ou senha inválidos", success: false }, { status: 401 })
    }

    console.log("[v0] Login successful for:", employee.name)

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    })
  } catch (error) {
    console.error("[v0] Error during login:", error)
    return NextResponse.json({ error: "Erro interno do servidor", success: false }, { status: 500 })
  }
}
