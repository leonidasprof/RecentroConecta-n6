"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, ScanIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function ValidationSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault()
      console.log("[v0] Error intercepted on success page:", event.message)
      return true
    }

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      console.log("[v0] Promise rejection intercepted on success page")
      return true
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handlePromiseRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handlePromiseRejection)
    }
  }, [])

  const handleContinueValidating = () => {
    console.log("[v0] Continuing validation - redirecting to scanner")
    router.push("/validacao/scanner")
  }

  const handleClose = () => {
    console.log("[v0] Closing - returning to admin panel")
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto" />
        </div>

        <div className="flex justify-center animate-bounce">
          <CheckCircle className="w-32 h-32 text-green-500" strokeWidth={2} />
        </div>

        <h1 className="text-4xl font-bold text-white">Ingresso validado com sucesso!</h1>

        <div className="flex flex-col gap-4 pt-8">
          <Button
            onClick={handleContinueValidating}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold h-14"
          >
            <ScanIcon className="w-5 h-5 mr-2" />
            Continuar Validando
          </Button>

          <Button
            onClick={handleClose}
            variant="outline"
            size="lg"
            className="w-full bg-white hover:bg-gray-100 text-slate-800 text-lg font-semibold h-14"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
