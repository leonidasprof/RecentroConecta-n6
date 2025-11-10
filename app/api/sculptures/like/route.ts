import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { sculptureId } = await request.json()

    if (!sculptureId) {
      return NextResponse.json({ error: "sculptureId é obrigatório" }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // For now, we'll just return success
    // In a real app, you would save this to a sculpture_likes table
    console.log("[v0] Sculpture liked:", sculptureId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing like:", error)
    return NextResponse.json({ error: "Erro ao processar like" }, { status: 500 })
  }
}
