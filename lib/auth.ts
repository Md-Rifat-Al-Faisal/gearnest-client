import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"

const dbUri =
  process.env.BETTER_AUTH_DB_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/gearnestdb"
const client = new MongoClient(dbUri)
const db = client.db(process.env.DB_NAME || "gearnestdb")

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
      return process.env.BETTER_AUTH_URL
    }
    if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
      return process.env.NEXT_PUBLIC_APP_URL
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000"
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "gearnest_auth_secret_minimum_32_characters_long_12345",
  baseURL: getBaseURL(),
  emailAndPassword: {
    enabled: true,
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
