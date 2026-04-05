"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type FamilyMember = {
  user_id: string
}

type FamilyInvite = {
  id: string
  email: string
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<FamilyInvite[]>([])
  const [email, setEmail] = useState("")
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [noFamily, setNoFamily] = useState(false)

  async function load() {
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) return

    const userId = userRes.user.id

    const { data: memberships } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)

    if (!memberships || memberships.length === 0) {
      setNoFamily(true)
      return
    }

    const membership = memberships[0]

    setNoFamily(false)
    setFamilyId(membership.family_id)
    setIsOwner(membership.role === "owner")

    const { data: membersData } = await supabase
      .from("family_members")
      .select("user_id")
      .eq("family_id", membership.family_id)

    setMembers((membersData || []) as FamilyMember[])

    const { data: invitesData } = await supabase
      .from("family_invites")
      .select("*")
      .eq("family_id", membership.family_id)

    setInvites((invitesData || []) as FamilyInvite[])
  }

  useEffect(() => {
    load()
  }, [])

  async function sendInvite() {
    if (!email || !familyId) return

    await supabase.from("family_invites").insert({
      family_id: familyId,
      email,
    })

    setEmail("")
    load()
  }

  async function removeMember(userIdToRemove: string) {
    await supabase
      .from("family_members")
      .delete()
      .eq("user_id", userIdToRemove)

    load()
  }

  if (noFamily) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">
          Family
        </h1>

        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3 text-center">
          <h2 className="text-white font-semibold">No Family Found</h2>
          <p className="text-sm text-white/60">
            Join or create a family plan to manage members and invites.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Family
      </h1>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Members</h2>

        {members.map((member, i) => (
          <div
            key={member.user_id}
            className="flex justify-between items-center text-white/80"
          >
            <span>Member {i + 1}</span>

            {isOwner && i !== 0 && (
              <button
                onClick={() => removeMember(member.user_id)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-semibold">Invite Member</h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="w-full p-3 rounded-xl bg-neutral-800 text-white"
          />

          <button
            onClick={sendInvite}
            className="w-full bg-blue-600 py-3 rounded-xl font-semibold"
          >
            Send Invite
          </button>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Pending Invites</h2>

        {invites.map((invite) => (
          <div key={invite.id} className="text-white/70 text-sm">
            {invite.email}
          </div>
        ))}
      </div>
    </div>
  )
}
