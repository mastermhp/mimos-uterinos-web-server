import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request) {
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

    const { db } = await connectToDatabase()
    const userId = decoded.userId

    let cycles = []

    // Strategy 1: ObjectId format
    if (ObjectId.isValid(userId)) {
      cycles = await db
        .collection("cycles")
        .find({ userId: new ObjectId(userId) })
        .sort({ startDate: -1 })
        .toArray()
    }

    // Strategy 2: String format if ObjectId didn't work
    if (cycles.length === 0) {
      cycles = await db.collection("cycles").find({ userId: userId.toString() }).sort({ startDate: -1 }).toArray()
    }

    // Strategy 3: Try both string and ObjectId in case of mixed data
    if (cycles.length === 0) {
      cycles = await db
        .collection("cycles")
        .find({
          $or: [{ userId: userId.toString() }, { userId: ObjectId.isValid(userId) ? new ObjectId(userId) : null }],
        })
        .sort({ startDate: -1 })
        .toArray()
    }

    console.log(`[v0] Found ${cycles.length} cycles for user ${userId}`)

    const cyclesTracked = cycles.length
    const avgCycleLength =
      cycles.length > 0
        ? Math.round(cycles.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycles.length)
        : 28
    const avgPeriodLength =
      cycles.length > 0
        ? Math.round(cycles.reduce((sum, cycle) => sum + (cycle.periodLength || 5), 0) / cycles.length)
        : 5

    return NextResponse.json({
      success: true,
      stats: {
        cyclesTracked,
        avgCycleLength,
        avgPeriodLength,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching user stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stats",
      },
      { status: 500 },
    )
  }
}
