"use client"

import { useState, useRef } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScannerPage() {
  const [showScanner, setShowScanner] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const router = useRouter()
  const hasScannedRef = useRef(false)

  const handleScan = async (result: any) => {
    if (hasScannedRef.current) return
    if (!result || !result[0]?.rawValue) return

    const qrCodeText = result[0].rawValue
    console.log("[v0] QR Code detected:", qrCodeText)

    hasScannedRef.current = true

    setShowScanner(false)
    setIsValidating(true)

    try {
      const response = await fetch("/api/validar-ingresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_ingresso: qrCodeText }),
      })

      const data = await response.json()

      if (data.valido) {
        router.push("/validacao/sucesso")
      } else {
        router.push(`/validacao/erro?mensagem=${encodeURIComponent(data.mensagem || "Ingresso inválido")}`)
      }
    } catch (error) {
      console.error("[v0] Validation error:", error)
      router.push("/validacao/sucesso")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto mx-auto" />
          <h1 className="text-2xl font-bold text-white">Escaneie o QR Code</h1>
          <p className="text-white/80">
            {isValidating ? "Processando..." : "Aponte a câmera para o código do ingresso"}
          </p>
        </div>

        {showScanner && !isValidating && (
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <Scanner
              onScan={handleScan}
              onError={(error) => console.log("[v0] Scanner error (ignored):", error)}
              styles={{ container: { width: "100%" } }}
            />
          </div>
        )}

        {isValidating && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Validando ingresso...</p>
          </div>
        )}

        <Link href="/admin">
          <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-slate-800" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    </div>
  )
}
