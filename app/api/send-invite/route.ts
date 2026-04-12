import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invite?token=${token}`

    await resend.emails.send({
      from: "Bible Athlete <onboarding@resend.dev>",
      to: email,
      subject: "You're invited to join a family on Bible Athlete",
      html: `
        <h2>You’ve been invited!</h2>
        <p>Click below to join your family:</p>

        <a href="${inviteLink}" style="
          display:inline-block;
          padding:12px 20px;
          background:#00ff99;
          color:black;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
        ">
          Accept Invite
        </a>

        <p style="margin-top:20px;">
          Or paste this link into your browser:
        </p>

        <p>${inviteLink}</p>

        <p>This link expires in 48 hours.</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return NextResponse.json({ error: "Email failed" }, { status: 500 })
  }
}
