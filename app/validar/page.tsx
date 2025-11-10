"use client"

import { useState, useEffect } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Scan, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabase } from "@/lib/supabase"

interface Ticket {
  id: number
  ticket_number: string
  ticket_type: string
  visitor_name: string
  visitor_type: string
  visit_date: string
  number_of_people: number
  is_validated: boolean
  validated_at: string | null
  validation_history: string | null
}

interface Booking {
  id: number
  visit_date: string
  validated: boolean
  booking_visitors: { visitor_name: string }[]
}

export default function ValidarPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    ticket?: Ticket
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dailyStats, setDailyStats] = useState({
    individual: 0,
    scheduled: 0,
    total: 0,
    validated: 0,
  })

  useEffect(() => {
    loadDailyStats()
  }, [])

  const loadDailyStats = async () => {
    try {
      const supabase = getSupabase()
      const today = new Date().toISOString().split("T")[0]

      const { data: tickets } = await supabase.from("tickets").select("*").eq("visit_date", today)

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, booking_visitors(*)")
        .eq("visit_date", today)

      const individualCount = tickets?.filter((t) => t.ticket_type === "individual").length || 0
      const scheduledVisitors = bookings?.reduce((sum, b) => sum + (b.booking_visitors?.length || 0), 0) || 0
      const validatedCount = tickets?.filter((t) => t.is_validated).length || 0
      const validatedBookings =
        bookings?.filter((b) => b.validated).reduce((sum, b) => sum + (b.booking_visitors?.length || 0), 0) || 0

      setDailyStats({
        individual: individualCount,
        scheduled: scheduledVisitors,
        total: individualCount + scheduledVisitors,
        validated: validatedCount + validatedBookings,
      })
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    }
  }

  const handleScan = async (detectedCodes: any[]) => {
    if (isProcessing || !detectedCodes || detectedCodes.length === 0) return

    const scannedValue = detectedCodes[0]?.rawValue
    if (!scannedValue) return

    setIsProcessing(true)
    console.log("[v0] QR Code scanned:", scannedValue)

    try {
      const supabase = getSupabase()

      if (scannedValue.includes("bookingId=")) {
        // It's a booking validation URL
        const urlParams = new URLSearchParams(scannedValue.split("?")[1])
        const bookingId = urlParams.get("bookingId")

        if (!bookingId) {
          setResult({
            success: false,
            message: "QR code inválido. Não foi possível identificar o agendamento.",
          })
          setScanning(false)
          setIsProcessing(false)
          return
        }

        // Call validate booking API
        const response = await fetch("/api/validate-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })

        const data = await response.json()

        if (data.success) {
          setResult({
            success: true,
            message: `Agendamento validado! ${data.visitors} visitante(s) registrado(s) com presença confirmada.`,
          })
        } else {
          setResult({
            success: false,
            message: data.error || "Erro ao validar agendamento.",
          })
        }

        setScanning(false)
        setIsProcessing(false)
        return
      }

      const { data: ticket, error: fetchError } = await supabase
        .from("tickets")
        .select("*")
        .eq("ticket_number", scannedValue)
        .single()

      if (fetchError || !ticket) {
        setResult({
          success: false,
          message: "Ingresso não encontrado. Verifique o QR code.",
        })
        setScanning(false)
        setIsProcessing(false)
        return
      }

      if (ticket.is_validated) {
        setResult({
          success: false,
          message: `Ingresso já foi validado em ${new Date(ticket.validated_at).toLocaleString("pt-BR")}`,
          ticket,
        })
        setScanning(false)
        setIsProcessing(false)
        return
      }

      const visitDate = new Date(ticket.visit_date)
      const now = new Date()
      const hoursDiff = (now.getTime() - visitDate.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        setResult({
          success: false,
          message: "Ingresso expirado. Válido apenas por 24 horas após emissão.",
          ticket,
        })
        setScanning(false)
        setIsProcessing(false)
        return
      }

      const validatedAt = new Date().toISOString()
      const validationHistory = `Presença confirmada em ${new Date(validatedAt).toLocaleString("pt-BR")} - Entrada validada`

      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          is_validated: true,
          validated_at: validatedAt,
          validation_history: validationHistory,
        })
        .eq("id", ticket.id)

      if (updateError) {
        console.error("[v0] Error validating ticket:", updateError)
        setResult({
          success: false,
          message: "Erro ao validar ingresso. Tente novamente.",
        })
        setScanning(false)
        setIsProcessing(false)
        return
      }

      setResult({
        success: true,
        message: "Ingresso validado com sucesso! Presença registrada.",
        ticket: { ...ticket, is_validated: true, validated_at: validatedAt, validation_history: validationHistory },
      })
      setScanning(false)
    } catch (error) {
      console.error("[v0] Validation error:", error)
      setResult({
        success: false,
        message: "Erro ao processar validação.",
      })
      setScanning(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = (error: any) => {
    console.error("[v0] QR Scanner error:", error)
  }

  const resetScanner = () => {
    setResult(null)
    setScanning(true)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Mapa
          </Button>
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Scan className="w-7 h-7" />
              Validação de Ingressos
            </CardTitle>
            <p className="text-white/90 text-sm mt-2">Escaneie o QR code do ingresso para validar a entrada</p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!scanning && !result && (
              <div className="text-center py-8">
                <Scan className="w-20 h-20 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Pronto para escanear</h3>
                <p className="text-slate-600 mb-6">Clique no botão abaixo para ativar a câmera e escanear ingressos</p>
                <Button
                  onClick={() => setScanning(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-14 px-8 text-lg font-semibold"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Iniciar Scanner
                </Button>
              </div>
            )}

            {scanning && !result && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-4 border-blue-500">
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                      facingMode: "environment",
                    }}
                    styles={{
                      container: {
                        width: "100%",
                        paddingTop: "100%",
                      },
                    }}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-lg font-semibold">Processando...</div>
                    </div>
                  )}
                </div>
                <p className="text-center text-sm text-slate-600">
                  Posicione o QR code do ingresso dentro da área de captura
                </p>
                <Button onClick={() => setScanning(false)} variant="outline" className="w-full" disabled={isProcessing}>
                  Cancelar
                </Button>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div
                  className={`rounded-xl p-6 ${
                    result.success
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500"
                      : "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {result.success ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                        {result.success ? "✓ Validado" : "✗ Inválido"}
                      </h3>
                      <p className={`text-base ${result.success ? "text-emerald-700" : "text-red-700"}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {result.ticket && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Nome:</strong> {result.ticket.visitor_name}
                        </p>
                        <p>
                          <strong>Tipo:</strong>{" "}
                          {result.ticket.ticket_type === "individual" ? "Individual" : "Agendamento"}
                        </p>
                        <p>
                          <strong>Visitantes:</strong> {result.ticket.number_of_people}
                        </p>
                        <p>
                          <strong>Data de Emissão:</strong>{" "}
                          {new Date(result.ticket.visit_date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-slate-500">
                          <strong>ID:</strong> {result.ticket.ticket_number}
                        </p>
                        {result.ticket.validation_history && (
                          <p className="text-xs text-slate-500">
                            <strong>Histórico:</strong> {result.ticket.validation_history}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={resetScanner} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Scan className="w-5 h-5 mr-2" />
                  Escanear Próximo Ingresso
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-600 font-semibold">Individual</p>
              <p className="text-2xl font-bold text-blue-700">{dailyStats.individual}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-purple-600 font-semibold">Agendados</p>
              <p className="text-2xl font-bold text-purple-700">{dailyStats.scheduled}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-600 font-semibold">Total Hoje</p>
              <p className="text-2xl font-bold text-green-700">{dailyStats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-amber-600 font-semibold">Validados</p>
              <p className="text-2xl font-bold text-amber-700">{dailyStats.validated}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
          <h4 className="font-semibold text-slate-800 mb-2">Instruções:</h4>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Ingressos são válidos por 24 horas após emissão</li>
            <li>Cada ingresso pode ser validado apenas uma vez</li>
            <li>A câmera precisa de permissão para funcionar</li>
            <li>Certifique-se de ter boa iluminação ao escanear</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
