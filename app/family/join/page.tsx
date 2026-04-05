"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type FamilyInvite = {
  id: string
  family_id: string
}

export default function JoinFamilyPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<FamilyInvite | null>(null)
  const [joined, setJoined] = useState(false)

  const token = params.get("token")

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .single()

      setInvite(data as FamilyInvite | null)
      setLoading(false)
    }

    load()
  }, [token])

  async function joinFamily() {
    const { data: userRes } = await supabase.auth.getUser()

    if (!userRes?.user) {
      router.push("/login")
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
      await supabase.from("family_members").insert({
        family_id: invite.family_id,
        user_id: userId,
        role: "member",
      })
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
    }, 1500)
  }

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!invite) {
    return <div className="text-white text-center mt-10">Invalid invite</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">
          🎉 You&apos;ve Been Invited!
        </h1>

        <p className="text-white/80">
          Join a family and start competing together
        </p>

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
