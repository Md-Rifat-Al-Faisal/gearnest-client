import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { getCurrentSession, getServerJwtToken } from "@/lib/server-auth"

const stripeKey = process.env.STRIPE_SECRET_KEY || ""
const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-12-18.acacia" as any,
})

export async function POST(req: Request) {
  try {
    const userSession = await getCurrentSession(true)
    if (!userSession?.user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const token = await getServerJwtToken()
    if (!token) {
      return NextResponse.json({ message: "Unable to authorize session token" }, { status: 401 })
    }

    const body = await req.json()
    const {
      bookingId: existingBookingId,
      equipmentId,
      startDate,
      endDate,
      quantity = 1,
      contactNumber,
      deliveryAddress,
      notes,
    } = body

    const getApiBase = () => {
      const url = process.env.NEXT_PUBLIC_API_URL
      if (url && !url.includes("localhost") && !url.includes("<") && !url.includes(">")) {
        return url.replace(/\/$/, "")
      }
      if (process.env.NODE_ENV === "production") {
        return "https://gearnest-server.vercel.app"
      }
      return (url || "http://localhost:5000").replace(/\/$/, "")
    }
    const apiBase = getApiBase()

    let bookingId = existingBookingId
    let totalAmount: number
    let equipmentName: string
    let equipmentImage: string | undefined
    let days: number
    let units: number
    let rentalType: string
    let newlyInitiatedBookingId: string | null = null

    if (existingBookingId) {
      // Resume checkout for an existing pending reservation
      const existingRes = await fetch(`${apiBase}/api/bookings/${existingBookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!existingRes.ok) {
        return NextResponse.json(
          { message: "Existing booking not found or unauthorized" },
          { status: existingRes.status }
        )
      }
      const existingData = await existingRes.json()
      const b = existingData.booking
      if (b.paymentStatus === "paid") {
        return NextResponse.json(
          { message: "This reservation is already paid and active" },
          { status: 400 }
        )
      }

      totalAmount = b.totalAmount
      equipmentName = b.equipmentName
      equipmentImage = b.equipmentImage
      days = b.days
      units = b.units
      rentalType = b.rentalType
    } else {
      // New booking reservation
      if (!equipmentId || !startDate || !endDate) {
        return NextResponse.json(
          { message: "Equipment ID, start date, and end date are required" },
          { status: 400 }
        )
      }

      const initiateRes = await fetch(`${apiBase}/api/bookings/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId,
          startDate,
          endDate,
          quantity,
          contactNumber,
          deliveryAddress,
          notes,
        }),
      })

      const initiateData = await initiateRes.json()

      if (!initiateRes.ok) {
        return NextResponse.json(
          { message: initiateData.message || "Failed to initiate booking with server" },
          { status: initiateRes.status }
        )
      }

      bookingId = initiateData.bookingId
      newlyInitiatedBookingId = initiateData.bookingId
      totalAmount = initiateData.totalAmount
      equipmentName = initiateData.equipmentName
      equipmentImage = initiateData.equipmentImage
      days = initiateData.days
      units = initiateData.units
      rentalType = initiateData.rentalType
    }

    const headerList = await headers()
    const rawOrigin =
      headerList.get("origin") ||
      headerList.get("referer")?.split("/").slice(0, 3).join("/") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ""
    const origin =
      rawOrigin && !rawOrigin.includes("<") && !rawOrigin.includes(">")
        ? rawOrigin
        : (process.env.NODE_ENV === "production" ? "https://gearnest-client.vercel.app" : "http://localhost:3000")
    const cleanOrigin = origin.replace(/\/$/, "")

    let session: Stripe.Checkout.Session
    try {
      // Create Stripe Checkout Session in payment mode with inline price_data
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: userSession.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: equipmentName,
                description: `Rental reservation: ${days} days (${units} ${rentalType?.toLowerCase()} units) x ${quantity} machine(s)`,
                images: equipmentImage ? [equipmentImage] : [],
              },
              unit_amount: Math.round(totalAmount * 100), // amount in cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingId: String(bookingId),
          equipmentId: String(equipmentId || ""),
          equipmentName: String(equipmentName || ""),
          quantity: String(quantity),
          userId: userSession.user.id,
          customerEmail: userSession.user.email,
        },
        success_url: `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cleanOrigin}/checkout/cancel?equipment_id=${equipmentId || ""}`,
      })
    } catch (stripeErr: any) {
      // Clean up newly created orphan booking if Stripe session creation fails
      if (newlyInitiatedBookingId) {
        try {
          await fetch(`${apiBase}/api/customer/rentals/${newlyInitiatedBookingId}/cancel`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch {
          // Cleanup best effort
        }
      }
      throw stripeErr
    }

    // Link Stripe Session ID to booking in backend
    try {
      await fetch(`${apiBase}/api/bookings/${bookingId}/session`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId: session.id }),
      })
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe Checkout Session creation error:", error)
    return NextResponse.json(
      { message: error.message || "Failed to initialize Stripe checkout" },
      { status: 500 }
    )
  }
}
