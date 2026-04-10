import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 🔥 PAYMENT SUCCESS
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (!userId || !plan) {
      console.error("Missing metadata")
      return NextResponse.json({ error: "Missing metadata" })
    }

    if (plan === "pro" || plan === "pro_plus") {
      // ✅ Individual plan
      await supabase
        .from("profiles")
        .update({ plan_type: plan })
        .eq("id", userId)
    }

    if (plan === "family_pro" || plan === "family_pro_plus") {
      // ✅ Family plan

      // 1. Get user's family
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
