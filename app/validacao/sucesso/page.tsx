"use client"

import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ValidationSuccessPage() {
  const router = useRouter()

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
          onClick={() => router.push("/admin?tab=validar")}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          Continuar Validando
        </Button>

        <Button onClick={() => router.push("/admin")} size="lg" variant="outline" className="w-full text-lg py-6">
          Fechar
        </Button>
      </div>
    </div>
  )
}
