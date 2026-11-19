const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/**
 * Retrieves the Better-Auth JWT token on the client side from /api/auth/token
 */
export async function getClientAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch("/api/auth/token", {
      credentials: "include",
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.token || null
  } catch {
    return null
  }
}

/**
 * Fetch wrapper for making calls to the GearNest Express backend.
 * Automatically attaches Bearer token if available.
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}, explicitToken?: string) {
  const headers = new Headers(options.headers || {})

  let token = explicitToken
  if (!token && typeof window !== "undefined") {
    token = (await getClientAuthToken()) || undefined
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers,
  })

  return response
}
