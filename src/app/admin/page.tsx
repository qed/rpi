import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard — RPI Admin',
}

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl text-rpiNavy">Admin Dashboard</h1>
      <p className="mt-2 text-rpiSlate">RPI Helper management panel</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/leads"
          className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-heading text-xl text-rpiNavy">Leads</h2>
          <p className="mt-2 text-sm text-rpiSlate">View and manage captured leads</p>
        </Link>

        <Link
          href="/admin/conversations"
          className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-heading text-xl text-rpiNavy">Conversations</h2>
          <p className="mt-2 text-sm text-rpiSlate">Browse AI chat conversations</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-heading text-xl text-rpiNavy">Analytics</h2>
          <p className="mt-2 text-sm text-rpiSlate">Funnel and quiz analytics</p>
        </Link>
      </div>
    </div>
  )
}
