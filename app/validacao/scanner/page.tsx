"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScannerPage() {
  const router = useRouter()
  const [dots, setDots] = useState(".")

  useEffect(() => {
    console.log("[v0] Scanner page mounted, will redirect to success in 2.5s")

    const timer = setTimeout(() => {
      console.log("[v0] Redirecting to success page")
      router.replace("/validacao/sucesso")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto mx-auto" />
          <h1 className="text-2xl font-bold text-white">Escaneando QR Code</h1>
          <p className="text-white/80">Aponte a câmera para o código do ingresso</p>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-square">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 border-4 border-white/30 rounded-lg">
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"
                  style={{
                    top: "50%",
                    animation: "scan 2s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500" />
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
              <Camera className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="text-white font-medium">Processando{dots}</span>
            </div>
          </div>
        </div>

        <Link href="/admin">
          <Button variant="outline" className="w-full bg-white hover:bg-gray-100 text-slate-800" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  )
}
