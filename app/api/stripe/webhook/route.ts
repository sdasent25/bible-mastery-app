import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT")

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  let event: Stripe.Event

  try {
    const rawBody = await req.text()
    const sig = req.headers.get("stripe-signature")

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Invalid Stripe signature", error)
    return new Response("Invalid signature", { status: 400 })
  }

  console.log("🔥 EVENT TYPE:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    console.log("🔥 METADATA:", { userId, plan })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (!userId || !plan) {
      console.error("Missing metadata", { userId, plan })
      return NextResponse.json({ error: "Missing metadata" })
    }

    // Individual plans
    if (plan === "pro" || plan === "pro_plus") {
      await supabase
        .from("profiles")
        .update({ plan_type: plan })
        .eq("id", userId)
    }

    // Family plans
    if (plan === "family_pro" || plan === "family_pro_plus") {
      const { data: member } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle()

      if (member?.family_id) {
        await supabase
          .from("families")
          .update({ plan_type: plan })
          .eq("id", member.family_id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
