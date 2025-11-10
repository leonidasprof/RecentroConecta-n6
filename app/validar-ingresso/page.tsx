"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react"

function ValidarIngressoContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState("")
  const [visitorsCount, setVisitorsCount] = useState(0)

  const handleValidate = async () => {
    if (!bookingId) {
      setError("Código de agendamento inválido")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/validate-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (data.success) {
        setValidated(true)
        setVisitorsCount(data.visitors || 0)
      } else {
        setError(data.error || "Erro ao validar agendamento")
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) {
      handleValidate()
    }
  }, [bookingId])

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Código Inválido
            </CardTitle>
            <CardDescription>O QR Code escaneado não contém um código de agendamento válido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (validated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Agendamento Validado!
            </CardTitle>
            <CardDescription>A entrada foi confirmada com sucesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-800">
                {visitorsCount} {visitorsCount === 1 ? "visitante validado" : "visitantes validados"}
              </p>
              <p className="text-sm text-green-600 mt-2">{new Date().toLocaleString("pt-BR")}</p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Todos os visitantes foram registrados no sistema com presença confirmada.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Erro na Validação
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleValidate} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tentando novamente...
                </>
              ) : (
                "Tentar Novamente"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            Validando Agendamento...
          </CardTitle>
          <CardDescription>Aguarde enquanto verificamos seu agendamento.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function ValidarIngressoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ValidarIngressoContent />
    </Suspense>
  )
}
