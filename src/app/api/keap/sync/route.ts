import { NextResponse } from 'next/server'
import { z } from 'zod'
import { syncLeadToKeap } from '@/lib/keap/sync'

const syncSchema = z.object({
  leadId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    // Simple admin auth check
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const { leadId } = syncSchema.parse(body)

    const result = await syncLeadToKeap(leadId)
    return NextResponse.json({ success: true, keapContactId: result.keapContactId })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
