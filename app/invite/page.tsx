"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function InvitePage() {
  const params = useSearchParams()
  const token = params.get("token")

  const [message, setMessage] = useState("Processing...")

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMessage("Invalid invite link")
        return
      }

      const supabase = createClient()

      const { data: invite } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .single()

      if (!invite) {
        setMessage("Invite not found")
        return
      }

      if (invite.status !== "pending") {
        setMessage("Invite already used")
        return
      }

      if (new Date(invite.expires_at) < new Date()) {
        setMessage("Invite expired")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("Please log in first")
        return
      }

      const { data, error } = await supabase.rpc("join_family", {
        user_id_input: user.id,
        family_id_input: invite.family_id
      })

      if (error || !data?.success) {
        console.error("Join failed:", error || data?.reason)
        setMessage("Unable to join family")
        return
      }

      await supabase
        .from("family_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id)

      setMessage("Successfully joined family 🎉")
    }

    run()
  }, [token])

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>{message}</h1>
    </div>
  )
}
