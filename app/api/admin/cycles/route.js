import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 100

    console.log(`🔍 Fetching all cycles (admin) with limit: ${limit}`)

    const { db } = await connectToDatabase()
    
    // Fetch all cycles from all users
    const cycles = await db.collection("cycles")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    console.log(`✅ Found ${cycles.length} cycles in database`)

    // Normalize cycle data
    const normalizedCycles = cycles.map(cycle => ({
      id: cycle._id?.toString() || cycle.id || Math.random().toString(36).substr(2, 9),
      userId: cycle.userId,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      cycleLength: cycle.cycleLength || 28,
      periodLength: cycle.periodLength || 5,
      flow: cycle.flow || "medium",
      mood: cycle.mood || "normal",
      symptoms: cycle.symptoms || [],
      temperature: cycle.temperature,
      notes: cycle.notes || "",
      createdAt: cycle.createdAt,
      updatedAt: cycle.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: normalizedCycles,
      total: normalizedCycles.length
    })

  } catch (error) {
    console.error("❌ Error fetching cycles (admin):", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch cycles" },
      { status: 500 }
    )
  }
}
