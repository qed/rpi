'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  email: string
  name: string | null
  score: number
  score_tier: string
  source: string
  created_at: string
  keap_synced_at: string | null
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'created_at'>('score')

  useEffect(() => {
    async function loadLeads() {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('tier', filter)
      params.set('sort', sortBy)

      const res = await fetch(`/api/admin/leads?${params.toString()}`)
      if (res.ok) {
        const data: { leads: Lead[] } = await res.json()
        setLeads(data.leads)
      }
    }
    void loadLeads()
  }, [filter, sortBy])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl text-rpiNavy">Leads</h1>

      <div className="mt-4 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All Tiers</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'created_at')}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="score">Sort by Score</option>
          <option value="created_at">Sort by Date</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Keap</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{lead.email}</td>
                <td className="px-4 py-3">{lead.name ?? '—'}</td>
                <td className="px-4 py-3 font-mono">{lead.score}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      lead.score_tier === 'hot'
                        ? 'bg-red-100 text-red-700'
                        : lead.score_tier === 'warm'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {lead.score_tier}
                  </span>
                </td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">
                  {lead.keap_synced_at ? '✓' : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="py-8 text-center text-gray-500">No leads found</p>
        )}
      </div>
    </div>
  )
}
