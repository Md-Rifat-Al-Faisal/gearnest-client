const FALLBACK_API = "https://gearnest-server.vercel.app"

export function getApiBaseUrl(): string {
  // If running in browser on localhost, always target the local Express server on port 5000
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  }
  // In production (e.g. deployed on Vercel), use configured env or fallback
  return process.env.NEXT_PUBLIC_API_URL || FALLBACK_API
}

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
 * If local backend (e.g. port 5000) is unreachable, seamlessly falls back to the live Vercel backend.
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
  const apiBase = getApiBaseUrl()

  try {
    const response = await fetch(`${apiBase}${cleanEndpoint}`, {
      ...options,
      headers,
    })
    return response
  } catch (err) {
    if (apiBase !== FALLBACK_API) {
      console.warn(`Local backend unreachable (${apiBase}). Falling back to live API (${FALLBACK_API})...`)
      return await fetch(`${FALLBACK_API}${cleanEndpoint}`, {
        ...options,
        headers,
      })
    }
    throw err
  }
}
