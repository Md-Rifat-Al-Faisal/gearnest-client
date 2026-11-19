import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"

export async function getCurrentSession(disableCache = false) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
    ...(disableCache ? { query: { disableCookieCache: true } } : {}),
  })
  return session
}

/**
 * Returns the signed Better-Auth JWT token on the server side for forwarding to Express API
 */
export async function getServerJwtToken(): Promise<string | null> {
  try {
    const reqHeaders = await headers()
    const tokenRes = await auth.api.getToken({
      headers: reqHeaders,
    })
    return tokenRes?.token || null
  } catch {
    return null
  }
}

export async function requireRole(allowedRole: "customer" | "owner" | "admin" | ("customer" | "owner" | "admin")[]) {
  // Always bypass cookieCache so admin role modifications in the database take effect immediately
  const session = await getCurrentSession(true)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role || "customer"
  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(userRole as "customer" | "owner" | "admin")
    : userRole === allowedRole

  if (!isAllowed) {
    redirect("/unauthorized")
  }

  return session
}
