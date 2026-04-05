import { NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Debug check for server logs without exposing the key itself.
    console.log("RESEND KEY EXISTS:", !!process.env.RESEND_API_KEY)

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY")
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = await req.json()
    const { email, inviteLink } = body

    if (!email || !inviteLink) {
      return NextResponse.json(
        { error: "Missing email or invite link" },
        { status: 400 },
      )
    }

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "You're invited to Bible Athlete",
      html: `
        <div style="font-family: sans-serif;">
          <h2>You’ve been invited!</h2>
          <p>Click below to join your family:</p>
          <a href="${inviteLink}">${inviteLink}</a>
        </div>
      `,
    })

    return NextResponse.json({ success: true, response })
  } catch (error: any) {
    console.error("EMAIL ERROR:", error)

    return NextResponse.json(
      { error: error.message || "Email failed" },
      { status: 500 },
    )
  }
}
