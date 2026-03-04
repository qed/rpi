'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  totalConversations: number
  totalMessages: number
  quizCompletions: number
  emailCaptures: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data: Stats = await res.json()
        setStats(data)
      }
    }
    void load()
  }, [])

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading...</div>

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, color: 'bg-rpiNavy' },
    { label: 'Hot Leads', value: stats.hotLeads, color: 'bg-red-500' },
    { label: 'Warm Leads', value: stats.warmLeads, color: 'bg-yellow-500' },
    { label: 'Cold Leads', value: stats.coldLeads, color: 'bg-blue-500' },
    { label: 'Conversations', value: stats.totalConversations, color: 'bg-rpiSlate' },
    { label: 'Messages', value: stats.totalMessages, color: 'bg-rpiSlate' },
    { label: 'Quiz Completions', value: stats.quizCompletions, color: 'bg-rpiGold' },
    { label: 'Email Captures', value: stats.emailCaptures, color: 'bg-green-500' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl text-rpiNavy">Analytics</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-rpiNavy">{stat.value}</p>
            <div className={`mt-2 h-1 w-12 rounded-full ${stat.color}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
