import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const key = process.env.RESEND_API_KEY

    console.log("RAW ENV VALUE:", key)
    console.log("TYPE:", typeof key)

    if (!key) {
      return NextResponse.json(
        { error: "ENV NOT FOUND" },
        { status: 500 },
      )
    }

    const { Resend } = await import("resend")
    const resend = new Resend(key)

    const body = await req.json()
    const { email, inviteLink } = body

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "You're invited to Bible Athlete",
      html: `<a href="${inviteLink}">Join Family</a>`,
    })

    return NextResponse.json({ success: true, response })
  } catch (error: any) {
    console.error("EMAIL ERROR:", error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    )
  }
}
