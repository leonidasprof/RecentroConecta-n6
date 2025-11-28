"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scan, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ValidarPage() {
  const [dailyStats, setDailyStats] = useState({
    individual: 0,
    scheduled: 0,
    total: 0,
    validated: 0,
  })
  const router = useRouter()

  useEffect(() => {
    try {
      loadDailyStats()
    } catch (error) {
      console.log("[v0] Error in useEffect, redirecting to success")
      window.location.replace("/validacao/sucesso")
    }
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
      console.log("[v0] Error loading stats, using defaults")
    }
  }

  const startValidation = () => {
    try {
      console.log("[v0] Opening scanner")
      window.location.href = "/validacao/scanner"
    } catch (error) {
      console.log("[v0] Fallback redirect")
      window.location.replace("/validacao/scanner")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
        </Link>

        <Card className="shadow-xl bg-white border-gray-200">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Scan className="w-7 h-7" />
              Validação de Ingressos
            </CardTitle>
            <p className="text-white/90 text-sm mt-2">Clique no botão para validar ingressos</p>
          </CardHeader>

          <CardContent className="p-6 space-y-6 bg-white">
            <div className="text-center py-8">
              <Scan className="w-20 h-20 mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Pronto para validar</h3>
              <p className="text-slate-600 mb-6">Clique no botão abaixo para validar um ingresso</p>
              <Button
                onClick={startValidation}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-14 px-8 text-lg font-semibold"
              >
                <Scan className="w-5 h-5 mr-2" />
                Validar Ingresso
              </Button>
            </div>
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
      </div>
    </div>
  )
}
