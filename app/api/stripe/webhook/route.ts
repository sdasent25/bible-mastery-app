import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT")

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("❌ SIGNATURE FAILED", err)
    return new NextResponse("Webhook Error", { status: 400 })
  }

  console.log("🔥 EVENT TYPE:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const user_id = session.metadata?.user_id
    const plan = session.metadata?.plan

    console.log("🔥 METADATA:", { user_id, plan })

    if (user_id && plan) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      await supabase
        .from("profiles")
        .update({ plan: plan })
        .eq("id", user_id)

      console.log("✅ PLAN UPDATED")
    }
  }

  return NextResponse.json({ received: true })
}
