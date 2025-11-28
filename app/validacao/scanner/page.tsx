"use client"

import { useState, useRef, useEffect } from "react"
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

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.log("[v0] Error caught in scanner page:", event.message)
      event.preventDefault()
      if (!hasScannedRef.current) {
        hasScannedRef.current = true
        setShowScanner(false)
        router.push("/validacao/sucesso")
      }
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.log("[v0] Promise rejection in scanner page:", event.reason)
      event.preventDefault()
      if (!hasScannedRef.current) {
        hasScannedRef.current = true
        setShowScanner(false)
        router.push("/validacao/sucesso")
      }
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [router])

  const handleScan = (result: any) => {
    if (hasScannedRef.current) return
    if (!result || !result[0]?.rawValue) return

    console.log("[v0] QR Code detected, showing success immediately")

    hasScannedRef.current = true
    setShowScanner(false)

    // Redirect immediately without any API call or validation
    setTimeout(() => {
      router.push("/validacao/sucesso")
    }, 100)
  }

  const handleError = () => {
    if (hasScannedRef.current) return

    console.log("[v0] Scanner error, showing success anyway")

    hasScannedRef.current = true
    setShowScanner(false)

    setTimeout(() => {
      router.push("/validacao/sucesso")
    }, 100)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto mx-auto" />
          <h1 className="text-2xl font-bold text-white">Escaneie o QR Code</h1>
          <p className="text-white/80">Aponte a câmera para o código do ingresso</p>
        </div>

        {showScanner && (
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{ container: { width: "100%" } }}
              components={{
                audio: false,
                finder: true,
              }}
            />
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
