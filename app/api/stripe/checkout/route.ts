import { NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }

  return new Stripe(secretKey)
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    let unitAmount = 0
    let name = ""

    switch (plan) {
      case "pro":
        unitAmount = 699
        name = "Bible Athlete Pro"
        break
      case "pro_plus":
        unitAmount = 1299
        name = "Bible Athlete Pro+"
        break
      case "family_pro":
        unitAmount = 1999
        name = "Bible Athlete Family Pro"
        break
      case "family_pro_plus":
        unitAmount = 2999
        name = "Bible Athlete Family Pro+"
        break
      default:
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 },
      )
    }

    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
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
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error)

    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    )
  }
}