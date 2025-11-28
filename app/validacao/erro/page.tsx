"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { XCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mensagem = searchParams.get("mensagem") || "Este ingresso não existe no sistema. Gere outro ingresso."

  const handleTryAgain = () => {
    router.push("/validacao/scanner")
  }

  const handleClose = () => {
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <img src="/images/logo.png" alt="RecentroConecta" className="h-16 w-auto" />
        </div>

        <div className="flex justify-center">
          <XCircle className="w-32 h-32 text-red-500" strokeWidth={2} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Ingresso Não Encontrado</h1>
          <p className="text-xl text-white/80">{mensagem}</p>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          <Button
            onClick={handleTryAgain}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold h-14"
          >
            Tentar Novamente
          </Button>

          <Button
            onClick={handleClose}
            variant="outline"
            size="lg"
            className="w-full bg-white hover:bg-gray-100 text-slate-800 text-lg font-semibold h-14"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Painel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ValidationErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ErrorContent />
    </Suspense>
  )
}
