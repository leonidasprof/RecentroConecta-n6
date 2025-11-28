import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo_ingresso } = body

    console.log("[v0] Validating ticket code:", codigo_ingresso)

    if (!codigo_ingresso) {
      return NextResponse.json({ valido: false, mensagem: "Código não fornecido" }, { status: 200 })
    }

    // Initialize Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Search for ticket by ticket_number or booking_code
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("ticket_number", codigo_ingresso)
      .single()

    if (ticket && !ticketError) {
      console.log("[v0] Ticket found in tickets table:", ticket.id)

      // Check if already validated
      if (ticket.is_validated) {
        return NextResponse.json(
          {
            valido: false,
            mensagem: "Este ingresso já foi validado anteriormente",
            detalhes: {
              validado_em: ticket.validated_at,
            },
          },
          { status: 200 },
        )
      }

      // Update ticket status to validated
      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          is_validated: true,
          validated_at: new Date().toISOString(),
        })
        .eq("id", ticket.id)

      if (updateError) {
        console.error("[v0] Error updating ticket:", updateError)
      }

      console.log("[v0] Ticket validated successfully")
      return NextResponse.json(
        {
          valido: true,
          mensagem: "Ingresso validado com sucesso",
          detalhes: {
            tipo: ticket.ticket_type,
            visitante: ticket.visitor_name,
            data_visita: ticket.visit_date,
          },
        },
        { status: 200 },
      )
    }

    // If not found in tickets, try bookings table
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_code", codigo_ingresso)
      .single()

    if (booking && !bookingError) {
      console.log("[v0] Booking found:", booking.id)

      // Check if already validated
      if (booking.validated) {
        return NextResponse.json(
          {
            valido: false,
            mensagem: "Esta reserva já foi validada anteriormente",
            detalhes: {
              validado_em: booking.validated_at,
            },
          },
          { status: 200 },
        )
      }

      // Update booking status to validated
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          validated: true,
          validated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)

      if (updateError) {
        console.error("[v0] Error updating booking:", updateError)
      }

      console.log("[v0] Booking validated successfully")
      return NextResponse.json(
        {
          valido: true,
          mensagem: "Reserva validada com sucesso",
          detalhes: {
            responsavel: booking.responsible_name,
            data_visita: booking.visit_date,
            total_visitantes: booking.total_visitors,
          },
        },
        { status: 200 },
      )
    }

    // Ticket/booking not found
    console.log("[v0] Ticket/booking not found in database")
    return NextResponse.json(
      {
        valido: false,
        mensagem: "Ingresso não encontrado no sistema",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error in validation API:", error)
    return NextResponse.json(
      {
        valido: false,
        mensagem: "Erro ao validar ingresso",
      },
      { status: 200 },
    )
  }
}
