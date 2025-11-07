import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
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

    const { data: ticket, error } = await supabase.from("tickets").select("*").eq("qr_code", qrCode).single()

    if (error || !ticket) {
      return NextResponse.json({ error: "Ingresso não encontrado", valid: false }, { status: 404 })
    }

    if (ticket.is_validated) {
      return NextResponse.json(
        {
          error: "Ingresso já validado",
          valid: false,
          ticket,
          validated_at: ticket.validated_at,
        },
        { status: 400 },
      )
    }

    const createdAt = new Date(ticket.created_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      return NextResponse.json(
        {
          error: "Ingresso expirado",
          valid: false,
          ticket,
        },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        is_validated: true,
        validated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id)

    if (updateError) {
      return NextResponse.json({ error: "Erro ao validar ingresso", valid: false }, { status: 500 })
    }

    return NextResponse.json({
      valid: true,
      message: "Ingresso validado com sucesso!",
      ticket: {
        ...ticket,
        is_validated: true,
        validated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error validating ticket:", error)
    return NextResponse.json({ error: "Erro interno do servidor", valid: false }, { status: 500 })
  }
}
