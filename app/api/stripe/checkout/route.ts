import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    let unit_amount = 0
    let name = ""

    switch (plan) {
      case "pro":
        unit_amount = 699
        name = "Pro Plan"
        break
      case "pro_plus":
        unit_amount = 1299
        name = "Pro+ Plan"
        break
      case "family_pro":
        unit_amount = 1999
        name = "Family Pro Plan"
        break
      case "family_pro_plus":
        unit_amount = 2999
        name = "Family Pro+ Plan"
        break
      default:
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
            },
            recurring: {
              interval: "month",
            },
            unit_amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Stripe error" }, { status: 500 })
  }
}
