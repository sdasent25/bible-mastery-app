import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  console.log("SEND INVITE API CALLED")

  const { email, inviteLink, familyName, inviter } = await req.json()

  try {
    console.log("Sending email to:", email)
    console.log("Invite link:", inviteLink)

    await resend.emails.send({
      from: "Bible Athlete <onboarding@yourdomain.com>",
      to: email,
      subject: "🔥 You’ve been invited to join a Bible Athlete family",
      html: `
        <div style="background:#020617;padding:40px;font-family:sans-serif;color:white;text-align:center;">
          <img src="https://yourdomain.com/flame-happy.png" width="80" />

          <h1 style="margin-top:20px;">You’ve Been Invited 🔥</h1>

          <p style="color:#cbd5f5;font-size:16px;">
            ${inviter} invited you to join:
          </p>

          <h2 style="margin:10px 0;">🏆 ${familyName}</h2>

          <p style="color:#94a3b8;">
            Train, compete, and grow together.
          </p>

          <a href="${inviteLink}" 
             style="
               display:inline-block;
               margin-top:20px;
               padding:14px 24px;
               background:#2563eb;
               color:white;
               text-decoration:none;
               border-radius:10px;
               font-weight:bold;
             ">
             Join Family
          </a>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
