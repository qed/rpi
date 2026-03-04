import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tier = searchParams.get('tier')
  const sort = searchParams.get('sort') ?? 'score'

  const supabase = createAdminClient()
  let query = supabase.from('leads').select('*')

  if (tier && tier !== 'all') {
    query = query.eq('score_tier', tier)
  }

  query = query.order(sort === 'score' ? 'score' : 'created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data })
}
