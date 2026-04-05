import { NextResponse } from "next/server"
import { addXp } from "@/lib/xp"

export async function POST(req: Request) {
  try {
    const { amount, source } = await req.json()

    if (!amount || !source) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const xp = await addXp(amount, source)

    return NextResponse.json({ xp })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to add XP" }, { status: 500 })
  }
}
