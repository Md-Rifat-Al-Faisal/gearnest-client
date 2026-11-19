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
      equipmentId,
      startDate,
      endDate,
      quantity = 1,
      contactNumber,
      deliveryAddress,
      notes,
    } = body

    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Equipment ID, start date, and end date are required" },
        { status: 400 }
      )
    }

    // Call Express /api/bookings/initiate with the JWT Bearer token
    const FALLBACK_API = "https://gearnest-server.vercel.app"
    const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API

    const requestPayload = {
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
    }

    let initiateRes: Response
    try {
      initiateRes = await fetch(`${apiBase}/api/bookings/initiate`, requestPayload)
    } catch {
      initiateRes = await fetch(`${FALLBACK_API}/api/bookings/initiate`, requestPayload)
    }

    const initiateData = await initiateRes.json()

    if (!initiateRes.ok) {
      return NextResponse.json(
        { message: initiateData.message || "Failed to initiate booking with server" },
        { status: initiateRes.status }
      )
    }

    const { bookingId, totalAmount, equipmentName, equipmentImage, days, units, rentalType } =
      initiateData

    const headerList = await headers()
    const origin =
      headerList.get("origin") ||
      headerList.get("referer")?.split("/").slice(0, 3).join("/") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    const cleanOrigin = origin.replace(/\/$/, "")

    // Create Stripe Checkout Session in payment mode with inline price_data
    const session = await stripe.checkout.sessions.create({
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
        equipmentId: String(equipmentId),
        equipmentName: String(equipmentName),
        quantity: String(quantity),
        userId: userSession.user.id,
        customerEmail: userSession.user.email,
      },
      success_url: `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanOrigin}/checkout/cancel?equipment_id=${equipmentId}`,
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe Checkout Session creation error:", error)
    return NextResponse.json(
      { message: error.message || "Failed to initialize Stripe checkout" },
      { status: 500 }
    )
  }
}
