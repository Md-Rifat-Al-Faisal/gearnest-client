const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  headers.set("Content-Type", "application/json")

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  return response
}
