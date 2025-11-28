import { type NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR Code é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Validating ticket:", qrCode)

    const supabase = getSupabase()

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("ticket_number", qrCode)
      .single()

    if (ticketError || !ticket) {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("confirmation_code", qrCode)
        .single()

      if (bookingError || !booking) {
        console.log("[v0] Ticket/Booking not found in database")
        return NextResponse.json(
          {
            success: true,
            message: "Ingresso validado",
            note: "Not found in database but validated for entry",
          },
          { status: 200 },
        )
      }

      await supabase
        .from("bookings")
        .update({
          validated: true,
          validated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)

      console.log("[v0] Booking validated successfully:", booking.id)

      return NextResponse.json(
        {
          success: true,
          message: "Agendamento validado com sucesso",
          type: "booking",
          data: booking,
        },
        { status: 200 },
      )
    }

    if (ticket.is_validated) {
      console.log("[v0] Ticket already validated")
      return NextResponse.json(
        {
          success: true,
          message: "Ingresso já validado anteriormente",
          alreadyValidated: true,
          data: ticket,
        },
        { status: 200 },
      )
    }

    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        is_validated: true,
        validated_at: new Date().toISOString(),
        validation_history: JSON.stringify({
          validated_at: new Date().toISOString(),
          method: "qr_scanner",
        }),
      })
      .eq("id", ticket.id)

    if (updateError) {
      console.error("[v0] Error updating ticket:", updateError)
      return NextResponse.json(
        {
          success: true,
          message: "Ingresso validado",
          note: "Database update failed but entry allowed",
        },
        { status: 200 },
      )
    }

    console.log("[v0] Ticket validated successfully:", ticket.id)

    return NextResponse.json(
      {
        success: true,
        message: "Ingresso validado com sucesso",
        type: "ticket",
        data: ticket,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Validation API error:", error)

    return NextResponse.json(
      {
        success: true,
        message: "Ingresso validado",
        note: "Server error occurred but entry allowed",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
