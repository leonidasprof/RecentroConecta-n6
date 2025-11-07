import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: Request) {
  try {
    const { employeeId } = await request.json()

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    console.log("[v0] API: Deleting employee:", employeeId)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.from("employees").delete().eq("id", employeeId)

    if (error) {
      console.error("[v0] API: Error deleting employee:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] API: Employee deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] API: Error deleting employee:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
