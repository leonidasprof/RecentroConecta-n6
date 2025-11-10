import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}

// Tipos do banco de dados
export interface ParkSettings {
  id: number
  is_open: boolean
  opening_time: string
  closing_time: string
  updated_at: string
}

export interface Sculpture {
  id: number
  code: string
  name: string
  description: string
  curiosity: string
  image_url?: string
  created_at: string
}

export interface Employee {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export interface Partner {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
}

export interface Ticket {
  id: number
  ticket_type: "individual" | "scheduled"
  visitor_type: "local" | "tourist" | "partner" | "other"
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  visit_date: string
  group_size?: number
  qr_code: string
  is_validated: boolean
  validated_at?: string
  created_at: string
}

export interface SculptureVisit {
  id: number
  sculpture_id: number
  visit_date: string
  created_at: string
}

export interface SatisfactionRating {
  id: number
  rating: number
  comment?: string
  created_at: string
}
