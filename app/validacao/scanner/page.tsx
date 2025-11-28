"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScannerPage() {
  const router = useRouter()
  const [dots, setDots] = useState(".")
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    console.log("[v0] Scanner simulation started - will redirect in 3 seconds")

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1
        console.log(`[v0] Countdown: ${next} seconds remaining`)
        return next
      })
    }, 1000)

    const redirectTimer = setTimeout(() => {
      console.log("[v0] Redirecting to success page now!")
      router.push("/validacao/sucesso")
    }, 3000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimer)
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-4">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Validando Ingresso</h1>
          <p className="text-white/80 text-lg">Aguarde enquanto processamos...</p>
        </div>

        {/* Scanner simulation box */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur border-2 border-green-500/30">
          <div className="aspect-square w-full flex items-center justify-center p-8">
            <div className="relative w-full h-full border-4 border-dashed border-green-500/50 rounded-2xl flex items-center justify-center">
              {/* Animated scanning line */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80 animate-scan" />
              </div>

              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-green-500 rounded-br-lg" />

              {/* Center icon */}
              <Camera className="w-20 h-20 text-green-500 animate-pulse" />
            </div>
          </div>

          {/* Processing status */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="bg-black/80 backdrop-blur px-6 py-3 rounded-full border border-green-500/50">
              <span className="text-white font-semibold text-lg">Processando{dots}</span>
            </div>
          </div>
        </div>

        {/* Countdown display */}
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold text-green-500 animate-pulse">{countdown}</div>
          <p className="text-white/60">segundos</p>
        </div>

        {/* Back button */}
        <Link href="/admin">
          <Button
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </Button>
        </Link>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
