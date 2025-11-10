import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 })
    }

    console.log("[v0] Sending confirmation email for booking:", bookingId)

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
      .select(
        `
        *,
        booking_visitors (*)
      `,
      )
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Error fetching booking:", bookingError)
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://recentroconecta.vercel.app"
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${baseUrl}/validar-ingresso?bookingId=${bookingId}`,
    )}`

    await supabase.from("bookings").update({ qr_code: qrCodeUrl }).eq("id", bookingId)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-code { text-align: center; margin: 30px 0; }
            .qr-code img { border: 3px solid #667eea; border-radius: 10px; }
            .visitor-list { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .visitor-item { padding: 10px; border-bottom: 1px solid #eee; }
            .visitor-item:last-child { border-bottom: none; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .booking-code { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Confirmação de Agendamento</h1>
              <p>Recentro Conecta - Parque das Esculturas</p>
            </div>
            <div class="content">
              <h2>Olá, ${booking.responsible_name}!</h2>
              <p>Seu agendamento foi confirmado com sucesso!</p>
              
              <div class="booking-code">
                Código: ${booking.booking_code}
              </div>
              
              <p><strong>Data da Visita:</strong> ${new Date(booking.visit_date).toLocaleDateString("pt-BR")}</p>
              <p><strong>Horário:</strong> ${booking.visit_time}</p>
              <p><strong>Total de Visitantes:</strong> ${booking.total_visitors}</p>
              <p><strong>Tipo de Visitante:</strong> ${booking.visitor_type}</p>
              
              <div class="qr-code">
                <h3>QR Code para Validação</h3>
                <p>Apresente este QR Code na entrada do parque:</p>
                <img src="${qrCodeUrl}" alt="QR Code" width="300" height="300" />
              </div>
              
              <div class="visitor-list">
                <h3>📋 Lista de Visitantes</h3>
                ${booking.booking_visitors
                  .map(
                    (visitor: any, index: number) => `
                  <div class="visitor-item">
                    <strong>${index + 1}. ${visitor.name}</strong><br>
                    Idade: ${visitor.age} anos<br>
                    ${visitor.document_type}: ${visitor.document_number}
                  </div>
                `,
                  )
                  .join("")}
              </div>
              
              <p><strong>⚠️ Importante:</strong></p>
              <ul>
                <li>Chegue com 15 minutos de antecedência</li>
                <li>Todos os visitantes listados devem apresentar documento</li>
                <li>Este QR Code é único e válido apenas para esta visita</li>
              </ul>
            </div>
            <div class="footer">
              <p>Recentro Conecta - Parque das Esculturas</p>
              <p>Em caso de dúvidas, entre em contato conosco.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Recentro Conecta" <${process.env.GMAIL_USER}>`,
      to: booking.responsible_email,
      subject: `Confirmação de Agendamento - ${booking.booking_code}`,
      html: emailHtml,
    })

    await supabase.from("bookings").update({ confirmation_sent: true }).eq("id", bookingId)

    console.log("[v0] Confirmation email sent successfully to:", booking.responsible_email)

    return NextResponse.json({
      success: true,
      message: "Email de confirmação enviado com sucesso!",
    })
  } catch (error: any) {
    console.error("[v0] Error sending confirmation email:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
