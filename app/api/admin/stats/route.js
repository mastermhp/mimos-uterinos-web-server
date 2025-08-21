import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"

export async function GET(request) {
  try {
    const authResult = verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()

    // Get total users
    const totalUsers = await db.collection("users").countDocuments()

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await db.collection("users").countDocuments({
      lastActive: { $gte: thirtyDaysAgo },
    })

    // Get total cycles tracked
    const totalCycles = await db.collection("cycles").countDocuments()

    // Get total symptoms logged
    const totalSymptoms = await db.collection("symptoms").countDocuments()

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCycles,
      totalSymptoms,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
