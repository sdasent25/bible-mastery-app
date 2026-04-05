"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type FamilyMember = {
  user_id: string
  status?: string | null
}

type FamilyInvite = {
  id: string
  email: string
  family_id: string
  token?: string | null
  accepted_at?: string | null
  status?: string | null
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [removedMembers, setRemovedMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<FamilyInvite[]>([])
  const [myInvites, setMyInvites] = useState<FamilyInvite[]>([])
  const [email, setEmail] = useState("")
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [noFamily, setNoFamily] = useState(false)

  async function load() {
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) return

    const userId = userRes.user.id
    const email = userRes.user.email
    if (!email) {
      setMyInvites([])
    } else {
      const { data: myInvitesData } = await supabase
        .from("family_invites")
        .select("*")
        .ilike("email", email.trim())
        .is("accepted_at", null)

      setMyInvites((myInvitesData || []) as FamilyInvite[])
    }

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
      .select("user_id, status")
      .eq("family_id", membership.family_id)

    const allMembers = (membersData || []) as FamilyMember[]
    const activeMembers = allMembers.filter((member) => member.status !== "pending_removal")
    const removedMembers = allMembers.filter((member) => member.status === "pending_removal")

    setMembers(activeMembers)
    setRemovedMembers(removedMembers)

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

    const { data } = await supabase
      .from("family_invites")
      .insert({
        family_id: familyId,
        email,
      })
      .select()
      .single()

    const inviteLink = `${window.location.origin}/family/join?token=${data.token}`

    alert(`Invite link:\n${inviteLink}`)

    setEmail("")
    load()
  }

  async function deleteInvite(inviteId: string) {
    await supabase
      .from("family_invites")
      .delete()
      .eq("id", inviteId)

    load()
  }

  async function resendInvite(invite: FamilyInvite) {
    const inviteLink = `${window.location.origin}/family/join?token=${invite.token}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      alert("Invite link copied! Paste it to share.")
    } catch (err) {
      prompt("Copy this invite link:", inviteLink)
    }
  }

  async function removeMember(userIdToRemove: string) {
    await supabase
      .from("family_members")
      .update({
        status: "pending_removal",
        removed_at: new Date().toISOString(),
      })
      .eq("user_id", userIdToRemove)

    load()
  }

  async function undoRemove(userIdToRestore: string) {
    await supabase
      .from("family_members")
      .update({
        status: "active",
        removed_at: null,
      })
      .eq("user_id", userIdToRestore)

    load()
  }

  async function acceptInvite(invite: FamilyInvite) {
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) return

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
      {myInvites.length > 0 && (
        <div className="border-2 border-blue-500 bg-blue-500/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-lg text-center">
            🎉 You've Been Invited!
          </h2>

          <p className="text-center text-white/80 text-sm">
            Join your family to start competing together
          </p>

          <h2 className="text-white font-semibold">
            Invites For You
          </h2>

          {myInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex justify-between items-center text-white/80"
            >
              <span>Family Invite</span>

              <button
                onClick={() => acceptInvite(invite)}
                className="bg-blue-600 px-4 py-2 rounded-xl text-sm"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold text-white text-center">
        Family
      </h1>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 flex justify-between">
        <div>
          <p className="text-sm text-white/60">Members</p>
          <p className="text-xl font-bold text-white">{members.length}</p>
        </div>

        <div>
          <p className="text-sm text-white/60">Family XP</p>
          <p className="text-xl font-bold text-white">
            {members.length * 100} XP
          </p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Leaderboard</h2>

        {members.map((member, i) => (
          <div
            key={member.user_id}
            className="flex justify-between items-center text-white/80"
          >
            <span>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`} Member {i + 1}
            </span>

            <span>{100 * (members.length - i)} XP</span>
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

        {invites.length === 0 && (
          <p className="text-white/60 text-sm">No pending invites</p>
        )}

        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-col gap-2 text-white/70 text-sm border-b border-neutral-800 pb-2"
          >
            <div className="flex justify-between items-center">
              <span>{invite.email}</span>
              <span className="text-yellow-400">Pending</span>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => resendInvite(invite)}
                  className="text-blue-400 text-xs"
                >
                  Resend
                </button>

                <button
                  onClick={() => {
                    if (confirm("Delete this invite?")) {
                      deleteInvite(invite.id)
                    }
                  }}
                  className="text-red-400 text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

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
                onClick={() => {
                  if (confirm("Remove this member?")) {
                    removeMember(member.user_id)
                  }
                }}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Recently Removed</h2>

        {removedMembers.length === 0 && (
          <p className="text-white/60 text-sm">No recent removals</p>
        )}

        {removedMembers.map((member) => (
          <div
            key={member.user_id}
            className="flex justify-between items-center text-white/70"
          >
            <span>Member</span>

            {isOwner && (
              <button
                onClick={() => undoRemove(member.user_id)}
                className="text-blue-400 text-sm"
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
