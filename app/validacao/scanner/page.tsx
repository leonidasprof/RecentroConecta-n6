"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { CheckCircle2, ArrowLeft, ScanIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ScannerPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      console.log("[v0] QR Code detected, showing success")
      setShowSuccess(true)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="flex justify-center">
            <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto" />
          </div>

          <div className="flex justify-center animate-bounce">
            <CheckCircle2 className="w-32 h-32 text-green-500" strokeWidth={2} />
          </div>

          <h1 className="text-4xl font-bold text-white">Ingresso validado com sucesso!</h1>

          <div className="flex flex-col gap-4 pt-8">
            <Button
              onClick={() => setShowSuccess(false)}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold h-14"
            >
              <ScanIcon className="w-5 h-5 mr-2" />
              Continuar Validando
            </Button>

            <Link href="/admin">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white hover:bg-gray-100 text-slate-800 text-lg font-semibold h-14"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Fechar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto mx-auto" />
          <h1 className="text-2xl font-bold text-white">Escaneie o QR Code</h1>
          <p className="text-white/80">Aponte a câmera para o código do ingresso</p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl">
          <Scanner
            onScan={handleScan}
            styles={{
              container: { width: "100%" },
            }}
          />
        </div>

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
