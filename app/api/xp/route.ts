import { NextResponse } from "next/server"
import { addXp } from "@/lib/xp"

export async function POST(req: Request) {
  try {
    const { amount, source, cardId } = await req.json()

    if (!amount || !source) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const result = await addXp({ amount, source, cardId, isFirstAttempt: true })

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to add XP" }, { status: 500 })
  }
}
