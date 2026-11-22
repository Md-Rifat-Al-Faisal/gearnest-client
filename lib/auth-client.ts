import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"
import type { auth } from "./auth"

const getClientBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && !appUrl.includes("<") && !appUrl.includes(">")) {
    return appUrl.trim().replace(/\/$/, "")
  }
  if (process.env.NODE_ENV === "production") {
    return "https://gearnest-client.vercel.app"
  }
  return "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [
    jwtClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
