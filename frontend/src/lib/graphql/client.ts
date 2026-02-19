const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql'
const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:4000/upload'

export async function gqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const json = await res.json()

  if (json.errors) {
    const message = json.errors.map((e: { message: string }) => e.message).join(', ')
    throw new Error(message)
  }

  return json.data as T
}

export async function uploadFile(file: File, token: string): Promise<{ url: string; path: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Upload failed')
  }

  return res.json()
}
