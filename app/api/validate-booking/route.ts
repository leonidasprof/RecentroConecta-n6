import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 })
    }

    console.log("[v0] Validating booking:", bookingId)

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    })

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        booking_visitors (*)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Error fetching booking:", bookingError)
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
    }

    if (booking.validated) {
      return NextResponse.json({ success: false, error: "Este agendamento já foi validado" }, { status: 400 })
    }

    const validatedAt = new Date().toISOString()
    await supabase
      .from("bookings")
      .update({
        validated: true,
        validated_at: validatedAt,
      })
      .eq("id", bookingId)

    for (const visitor of booking.booking_visitors) {
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        ticket_type: "agendamento",
        visitor_type: booking.visitor_type,
        visitor_name: visitor.name,
        visitor_document_type: visitor.document_type,
        visitor_document_number: visitor.document_number,
        visit_date: booking.visit_date,
        visit_time: booking.visit_time,
        number_of_people: 1,
        is_validated: true,
        validated_at: validatedAt,
        validation_history: `Validado em ${new Date(validatedAt).toLocaleString("pt-BR")} via agendamento ${booking.booking_code}`,
      })
    }

    console.log("[v0] Booking validated successfully with", booking.booking_visitors.length, "tickets created")

    return NextResponse.json({
      success: true,
      message: "Agendamento validado com sucesso!",
      visitors: booking.booking_visitors.length,
    })
  } catch (error: any) {
    console.error("[v0] Error validating booking:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
