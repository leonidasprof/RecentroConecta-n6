import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Sending confirmation email for booking:", bookingId)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const validationUrl = `${baseUrl}/validar?bookingId=${bookingId}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(validationUrl)}`

    await supabase.from("bookings").update({ qr_code: validationUrl }).eq("id", bookingId)

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.95; }
            .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
            .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; margin: 20px 0; }
            .booking-code { font-size: 32px; font-weight: bold; color: #10b981; margin: 25px 0; text-align: center; letter-spacing: 2px; background: #f0fdf4; padding: 20px; border-radius: 10px; border: 2px dashed #10b981; }
            .info-section { margin: 25px 0; }
            .info-label { font-weight: bold; color: #4b5563; margin-bottom: 5px; }
            .info-value { color: #1f2937; font-size: 16px; margin-bottom: 15px; }
            .qr-code { text-align: center; margin: 35px 0; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); border-radius: 12px; }
            .qr-code h3 { color: #065f46; margin-bottom: 15px; }
            .qr-code img { border: 4px solid #10b981; border-radius: 12px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
            .qr-instruction { color: #059669; font-size: 14px; margin-top: 15px; font-weight: 600; }
            .visitor-list { background: #f9fafb; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981; }
            .visitor-list h3 { color: #065f46; margin-top: 0; display: flex; align-items: center; gap: 8px; }
            .visitor-item { padding: 15px; margin: 10px 0; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
            .visitor-item strong { color: #1f2937; font-size: 16px; }
            .visitor-details { color: #6b7280; font-size: 14px; margin-top: 5px; }
            .important-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .important-box h4 { color: #92400e; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px; }
            .important-box ul { margin: 0; padding-left: 20px; color: #78350f; }
            .important-box li { margin: 8px 0; }
            .footer { text-align: center; padding: 30px 20px; color: #6b7280; font-size: 14px; }
            .footer-logo { color: #10b981; font-weight: bold; font-size: 16px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Agendamento Confirmado!</h1>
              <p>Parque das Esculturas Francisco Brennand</p>
            </div>
            <div class="content">
              <p class="greeting">Olá, <strong>${booking.responsible_name}</strong>!</p>
              
              <div class="success-badge">
                ✓ Seu agendamento foi processado e confirmado com sucesso!
              </div>
              
              <div class="booking-code">
                ${booking.booking_code}
              </div>
              
              <div class="info-section">
                <div class="info-label">📅 Data da Visita:</div>
                <div class="info-value">${new Date(booking.visit_date).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                
                <div class="info-label">🕐 Horário:</div>
                <div class="info-value">${booking.visit_time}</div>
                
                <div class="info-label">👥 Total de Visitantes:</div>
                <div class="info-value">${booking.total_visitors} pessoa(s)</div>
              </div>
              
              <div class="qr-code">
                <h3>🎫 QR Code de Validação</h3>
                <p class="qr-instruction">Apresente este código na entrada do parque:</p>
                <img src="${qrCodeUrl}" alt="QR Code de Validação" width="300" height="300" />
                <p class="qr-instruction">
                  ⚡ Este QR Code validará automaticamente todos os visitantes abaixo
                </p>
              </div>
              
              <div class="visitor-list">
                <h3>📋 Lista Completa de Visitantes</h3>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                  Todos os visitantes listados terão sua presença confirmada ao escanear o QR Code:
                </p>
                ${booking.booking_visitors
                  .map(
                    (visitor: any, index: number) => `
                  <div class="visitor-item">
                    <strong>${index + 1}. ${visitor.name}</strong>
                    <div class="visitor-details">
                      Idade: ${visitor.age} anos • ${visitor.document_type}: ${visitor.document_number}
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
              
              <div class="important-box">
                <h4>⚠️ Informações Importantes</h4>
                <ul>
                  <li><strong>Chegue com 15 minutos de antecedência</strong> ao horário marcado</li>
                  <li>Todos os visitantes devem <strong>apresentar documento com foto</strong></li>
                  <li>Este QR Code é <strong>único e intransferível</strong></li>
                  <li>Após a leitura do QR Code, <strong>todos os visitantes da lista serão automaticamente validados</strong></li>
                  <li>Guarde este e-mail para consulta no dia da visita</li>
                </ul>
              </div>
              
              <p style="color: #059669; font-weight: bold; text-align: center; margin-top: 30px;">
                Aguardamos sua visita! 🎨
              </p>
            </div>
            <div class="footer">
              <div class="footer-logo">Recentro Conecta</div>
              <p>Parque das Esculturas Francisco Brennand</p>
              <p style="margin-top: 10px;">Em caso de dúvidas, entre em contato conosco.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"Recentro Conecta - Parque das Esculturas" <${process.env.GMAIL_USER}>`,
      to: booking.responsible_email,
      subject: `✓ Confirmação de Agendamento - ${booking.booking_code}`,
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
