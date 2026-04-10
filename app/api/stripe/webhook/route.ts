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

    await supabase
      .from("user_access")
      .upsert({
        user_id: userId,
        final_plan: plan,
        in_family: plan.includes("family")
      }, { onConflict: "user_id" })
  }

  return NextResponse.json({ received: true })
}
