const KEAP_API_BASE = 'https://api.infusionsoft.com/crm/rest/v1'

interface KeapRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  path: string
  body?: Record<string, unknown>
}

export async function keapRequest<T>({ method, path, body }: KeapRequestOptions): Promise<T> {
  const token = process.env.KEAP_ACCESS_TOKEN
  if (!token) throw new Error('KEAP_ACCESS_TOKEN not configured')

  const url = `${KEAP_API_BASE}${path}`
  let lastError: Error | null = null

  // Retry with exponential backoff (3 attempts)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Keap API ${response.status}: ${errorBody}`)
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError
}
