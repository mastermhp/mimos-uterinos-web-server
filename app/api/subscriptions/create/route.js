import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    const { planId } = await request.json()
    const { db } = await connectToDatabase()

    // Define subscription plans
    const plans = {
      monthly: {
        name: "Monthly Premium",
        price: 4.99,
        duration: 30,
        features: ["ad_free", "advanced_analytics", "unlimited_notes", "health_reports", "ai_predictions"],
      },
      yearly: {
        name: "Yearly Premium",
        price: 39.99,
        duration: 365,
        features: ["ad_free", "advanced_analytics", "unlimited_notes", "health_reports", "ai_predictions"],
      },
      lifetime: {
        name: "Lifetime Premium",
        price: 99.99,
        duration: null, // Lifetime
        features: ["ad_free", "advanced_analytics", "unlimited_notes", "health_reports", "ai_predictions"],
      },
    }

    const selectedPlan = plans[planId]
    if (!selectedPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan selected",
        },
        { status: 400 },
      )
    }

    const now = new Date()
    const expiresAt = selectedPlan.duration
      ? new Date(now.getTime() + selectedPlan.duration * 24 * 60 * 60 * 1000)
      : null // Lifetime subscription

    // Create subscription record
    const subscription = {
      userId: new ObjectId(decoded.userId),
      planId,
      planName: selectedPlan.name,
      price: selectedPlan.price,
      features: selectedPlan.features,
      status: "active",
      startDate: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("subscriptions").insertOne(subscription)

    // Update user's subscription status
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          subscriptionPlan: selectedPlan.name,
          subscriptionStatus: "active",
          subscriptionFeatures: selectedPlan.features,
          updatedAt: now,
        },
      },
    )

    console.log("✅ Subscription created successfully:", result.insertedId)

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
      subscription: {
        id: result.insertedId,
        ...subscription,
      },
    })
  } catch (error) {
    console.error("❌ Error creating subscription:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subscription",
      },
      { status: 500 },
    )
  }
}
