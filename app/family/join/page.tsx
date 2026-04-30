"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type FamilyInvite = {
  id: string
  family_id: string
  invited_by?: string | null
  families?: {
    name?: string | null
  } | null
}

export default function JoinFamilyPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<FamilyInvite | null>(null)
  const [joined, setJoined] = useState(false)
  const [inviterEmail, setInviterEmail] = useState("")

  const token = params.get("token")

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("family_invites")
        .select(`
          *,
          families(name),
          invited_by
        `)
        .eq("token", token)
        .single()

      setInvite(data as FamilyInvite | null)
      setInviterEmail("A family member")

      if ((data as FamilyInvite | null)?.invited_by) {
        await supabase
          .from("profiles")
          .select("id")
          .eq("id", (data as FamilyInvite).invited_by)
          .maybeSingle()

        setInviterEmail("A family member")
      }

      setLoading(false)
    }

    load()
  }, [token])

  useEffect(() => {
    async function autoJoin() {
      const { data: userRes } = await supabase.auth.getUser()

      if (userRes?.user && invite && !joined) {
        joinFamily()
      }
    }

    autoJoin()
  }, [invite, joined])

  async function joinFamily() {
    const { data: userRes } = await supabase.auth.getUser()

    if (!userRes?.user) {
      router.push(`/login?redirect=/family/join?token=${token}`)
      return
    }

    if (!invite) return

    const userId = userRes.user.id

    const { data: existingMemberships } = await supabase
      .from("family_members")
      .select("user_id")
      .eq("user_id", userId)
      .eq("family_id", invite.family_id)

    if (!existingMemberships || existingMemberships.length === 0) {
      const { data, error } = await supabase.rpc("join_family", {
        user_id_input: userId,
        family_id_input: invite.family_id
      })

      if (error || !data?.success) {
        console.error("Join failed:", error || data?.reason)
        alert("Unable to join family")
        return
      }
    }

    await supabase
      .from("family_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id)

    setJoined(true)

    setTimeout(() => {
      router.push("/dashboard")
    }, 1200)
  }

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!invite) {
    return <div className="text-white text-center mt-10">Invalid invite</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md w-full space-y-5 text-center">
        <img
          src="/flame-happy.png"
          className="w-20 h-20 mx-auto animate-float"
          alt="happy flame mascot"
        />

        <h1 className="text-2xl font-bold text-white">
          🎉 You&apos;ve Been Invited!
        </h1>

        <p className="text-white/80">
          Join a family and start competing together
        </p>

        {invite.families?.name && (
          <div className="bg-neutral-800 rounded-xl p-3">
            <p className="text-sm text-white/60">Family</p>
            <p className="text-white font-medium">
              {invite.families.name}
            </p>
          </div>
        )}

        <div className="bg-neutral-800 rounded-xl p-3">
          <p className="text-sm text-white/60">Invited by</p>
          <p className="text-white font-medium">
            {inviterEmail}
          </p>
        </div>

        {!joined ? (
          <button
            onClick={joinFamily}
            className="w-full bg-blue-600 py-3 rounded-xl font-semibold"
          >
            Join Family
          </button>
        ) : (
          <p className="text-green-400 font-semibold">
            Joined successfully!
          </p>
        )}
      </div>
    </div>
  )
}
