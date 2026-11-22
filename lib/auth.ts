import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"

const getDbUri = () => {
  const uri = process.env.BETTER_AUTH_DB_URI
  if (uri && !uri.includes("<") && !uri.includes(">")) {
    return uri
  }
  const fallback = process.env.MONGODB_URI
  if (fallback && !fallback.includes("<") && !fallback.includes(">")) {
    return fallback
  }
  return "mongodb://localhost:27017/gearnestdb"
}

const dbUri = getDbUri()
const client = new MongoClient(dbUri)
const db = client.db(process.env.DB_NAME || "gearnestdb")

const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim()
  if (
    trimmed.includes("<") ||
    trimmed.includes(">") ||
    trimmed.includes("localhost") ||
    trimmed.includes("your-")
  ) {
    return false
  }
  try {
    const parsed = new URL(trimmed)
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !parsed.hostname.includes("<") &&
      !parsed.hostname.includes(">")
    )
  } catch {
    return false
  }
}

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    if (isValidUrl(process.env.BETTER_AUTH_URL)) {
      return process.env.BETTER_AUTH_URL!.trim().replace(/\/$/, "")
    }
    if (isValidUrl(process.env.NEXT_PUBLIC_APP_URL)) {
      return process.env.NEXT_PUBLIC_APP_URL!.trim().replace(/\/$/, "")
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`
    }
    return "https://gearnest-client.vercel.app"
  }
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("<")) {
    return process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "")
  }
  return "http://localhost:3000"
}

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "1ae56ac39fe9f53869b22e636ed65b97b96afb4b7d9acc7a799840aadb2f0fe5"

export const auth = betterAuth({
  secret: authSecret,
  baseURL: getBaseURL(),
  trustedOrigins: [
    "https://gearnest-client.vercel.app",
    "https://gearnest-server.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`] : []),
    ...(isValidUrl(process.env.BETTER_AUTH_URL) ? [process.env.BETTER_AUTH_URL!.trim().replace(/\/$/, "")] : []),
    ...(isValidUrl(process.env.NEXT_PUBLIC_APP_URL) ? [process.env.NEXT_PUBLIC_APP_URL!.trim().replace(/\/$/, "")] : []),
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      address: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: "customer", // Force default role customer on all registrations
            },
          }
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 5 * 24 * 60 * 60,
    },
  },
  plugins: [
    jwt(),
  ],
  database: mongodbAdapter(db, {
    client,
  }),
})
