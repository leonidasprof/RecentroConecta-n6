"use client"

import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
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
    try {
      console.log("[v0] Continuing validation - redirecting to /validar")
      router.push("/validar")
    } catch (error) {
      console.log("[v0] Error in handleContinueValidating, using window.location")
      window.location.href = "/validar"
    }
  }

  const handleClose = () => {
    try {
      console.log("[v0] Closing - returning to admin panel")
      router.push("/admin")
    } catch (error) {
      console.log("[v0] Error in handleClose, using window.location")
      window.location.href = "/admin"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white text-center">RecentroConecta</h1>
      </div>

      {/* Check Icon */}
      <div className="mb-8">
        <CheckCircle className="w-32 h-32 text-green-500 animate-pulse" strokeWidth={2} />
      </div>

      {/* Success Message */}
      <h2 className="text-4xl font-bold text-white text-center mb-12">Ingresso validado com sucesso!</h2>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          onClick={handleContinueValidating}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          Continuar Validando
        </Button>

        <Button onClick={handleClose} size="lg" variant="outline" className="w-full text-lg py-6 bg-white">
          Fechar
        </Button>
      </div>
    </div>
  )
}
