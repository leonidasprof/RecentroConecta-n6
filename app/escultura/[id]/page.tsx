import { Suspense } from "react"
import { createClient } from "@supabase/supabase-js"
import SculpturePublicView from "@/components/sculpture-public-view"

async function getSculpture(id: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { data, error } = await supabase.from("sculptures").select("*").eq("id", id).limit(1).single()

  if (error) {
    console.error("[v0] Error loading sculpture:", error)
    return null
  }

  console.log("[v0] Loaded sculpture for public view:", data)
  return data
}

export default async function SculpturePage({ params }: { params: { id: string } }) {
  const sculpture = await getSculpture(params.id)

  if (!sculpture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Escultura não encontrada</h1>
          <p className="text-gray-600">A escultura que você procura não existe ou foi removida.</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SculpturePublicView sculpture={sculpture} />
    </Suspense>
  )
}
