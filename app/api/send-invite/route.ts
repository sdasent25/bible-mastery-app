import { Resend } from "resend"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { email, inviteLink, familyName, inviter } = await req.json()

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY")
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "🔥 You’ve been invited to join a Bible Athlete family",
      html: `
        <div style="background:#020617;padding:40px;font-family:sans-serif;color:white;text-align:center;">
          
          <h1>You’ve Been Invited 🔥</h1>

          <p>${inviter} invited you to join:</p>

          <h2>${familyName}</h2>

          <a href="${inviteLink}" 
             style="display:inline-block;margin-top:20px;padding:14px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:10px;font-weight:bold;">
             Join Family
          </a>
        </div>
      `,
    })

    console.log("EMAIL SENT:", response)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
