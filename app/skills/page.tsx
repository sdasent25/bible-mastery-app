'use client'

import { useState } from 'react'

const skills = [
  { name: 'Gospels', unlocked: true },
  { name: 'Faith', unlocked: true },
  { name: 'Love', unlocked: false },
  { name: 'Prayer', unlocked: false }
]

export default function SkillsPage() {
  const [skillList] = useState(skills)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Skill Tree
        </h1>

        <div className="space-y-4">

          {skillList.map((skill) => (
            <div
              key={skill.name}
              className={`p-5 rounded-xl border font-semibold ${
                skill.unlocked
                  ? 'bg-white text-gray-900 border-gray-200'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {skill.unlocked ? '🔓' : '🔒'} {skill.name}
            </div>
          ))}

        </div>

      </div>
    </div>
  )
}
