import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT")

  const event = await req.json()

  console.log("🔥 EVENT TYPE:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    const user_id = session.metadata?.user_id
    const plan = session.metadata?.plan

    console.log("🔥 METADATA:", { user_id, plan })

    if (user_id && plan) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { error } = await supabase
        .from("profiles")
        .update({ plan: plan })
        .eq("id", user_id)

      if (error) {
        console.error("❌ SUPABASE ERROR:", error)
      } else {
        console.log("✅ PLAN UPDATED")
      }
    }
  }

  return NextResponse.json({ received: true })
}
