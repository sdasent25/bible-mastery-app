"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type ProfileRow = {
  name?: string | null
  xp?: number | null
}

type FamilyMemberRow = {
  user_id: string
  role: string | null
  profiles?: ProfileRow | ProfileRow[] | null
}

function getProfile(profile: FamilyMemberRow["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null
  }

  return profile ?? null
}

export default function LeaderboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [hasMembership, setHasMembership] = useState<boolean | null>(null)
  const [members, setMembers] = useState<FamilyMemberRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("LEADERBOARD USER", user)

      if (!user) {
        setHasMembership(false)
        setMembers([])
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data: membership, error: membershipError } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .is("removed_at", null)
        .maybeSingle()

      console.log("LEADERBOARD MEMBERSHIP", membership, membershipError)

      if (!membership?.family_id) {
        setHasMembership(false)
        setMembers([])
        setLoading(false)
        return
      }

      setHasMembership(true)

      const { data: familyMembers } = await supabase
        .from("family_members")
        .select(`
          user_id,
          role,
          profiles (
            name,
            xp
          )
        `)
        .eq("family_id", membership.family_id)
        .eq("status", "active")

      const normalizedMembers = ((familyMembers ?? []) as FamilyMemberRow[]).map((member) => ({
        ...member,
        profiles: getProfile(member.profiles),
      }))

      console.log("LEADERBOARD MEMBERS", normalizedMembers)

      setMembers(normalizedMembers)
      setLoading(false)
    }

    void loadLeaderboard()
  }, [])

  const sorted = [...members].sort(
    (a, b) => (((b.profiles as ProfileRow | null)?.xp) || 0) - (((a.profiles as ProfileRow | null)?.xp) || 0)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/20">
            <h1 className="text-3xl font-bold">Family Leaderboard</h1>
            <p className="mt-4 text-base text-slate-200">
              Loading...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (hasMembership === false) {
    return (
      <div className="min-h-screen bg-[#0B1220] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/20">
            <h1 className="text-3xl font-bold">Family Leaderboard</h1>
            <p className="mt-4 text-base text-slate-200">
              Create or join a family to compete
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1220] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-400">
            Family
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            See who&apos;s leading your family by total XP.
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-base text-slate-200 shadow-2xl shadow-black/20">
            Create or join a family to compete
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/20 sm:p-6">
            <div className="mb-3 grid grid-cols-[72px_minmax(0,1fr)_88px] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Rank</span>
              <span>Name</span>
              <span className="text-right">XP</span>
            </div>

            <div className="space-y-3">
              {sorted.map((member, index) => {
                const profile = member.profiles as ProfileRow | null
                const isCurrentUser = member.user_id === userId

                return (
                  <div
                    key={member.user_id}
                    className="grid grid-cols-[72px_minmax(0,1fr)_88px] items-center gap-3 rounded-2xl bg-slate-800 p-4"
                  >
                    <div className="text-lg font-bold text-white">
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-base font-medium text-white">
                          {isCurrentUser ? "You" : profile?.name || "Member"}
                        </span>

                        {member.role === "owner" && (
                          <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-semibold text-yellow-300">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-base font-semibold text-yellow-400">
                      {profile?.xp || 0}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
