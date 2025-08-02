import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock cycle data
const mockCycles = [
  {
    id: 1,
    userId: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    cycleLength: 28,
    periodLength: 5,
    symptoms: [
      { date: "2024-01-01", symptoms: ["cramps", "mood_swings"], severity: "moderate" },
      { date: "2024-01-02", symptoms: ["cramps", "bloating"], severity: "mild" },
      { date: "2024-01-03", symptoms: ["fatigue"], severity: "mild" },
    ],
    flow: [
      { date: "2024-01-01", flow: "heavy" },
      { date: "2024-01-02", flow: "medium" },
      { date: "2024-01-03", flow: "light" },
      { date: "2024-01-04", flow: "light" },
      { date: "2024-01-05", flow: "spotting" },
    ],
    mood: [
      { date: "2024-01-01", mood: "irritable" },
      { date: "2024-01-02", mood: "sad" },
      { date: "2024-01-03", mood: "normal" },
    ],
    notes: "Regular cycle, no unusual symptoms",
    createdAt: "2024-01-01T09:00:00Z",
  },
  {
    id: 2,
    userId: 2,
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    cycleLength: 30,
    periodLength: 4,
    symptoms: [
      { date: "2024-01-08", symptoms: ["bloating", "fatigue"], severity: "mild" },
      { date: "2024-01-09", symptoms: ["headache"], severity: "moderate" },
    ],
    flow: [
      { date: "2024-01-08", flow: "medium" },
      { date: "2024-01-09", flow: "heavy" },
      { date: "2024-01-10", flow: "medium" },
      { date: "2024-01-11", flow: "light" },
    ],
    mood: [
      { date: "2024-01-08", mood: "normal" },
      { date: "2024-01-09", mood: "happy" },
    ],
    notes: "Shorter period this month",
    createdAt: "2024-01-08T08:30:00Z",
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const { db } = await connectToDatabase()
    const query = {}
    if (userId) query.userId = new ObjectId(userId)
    const cycles = await db.collection("cycles").find(query).toArray()

    let filteredCycles = cycles
    if (userId) {
      filteredCycles = cycles.filter((cycle) => cycle.userId.toString() === userId)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCycles = filteredCycles.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedCycles,
      pagination: {
        page,
        limit,
        total: filteredCycles.length,
        totalPages: Math.ceil(filteredCycles.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching cycles:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cycleData = await request.json()

    const { db } = await connectToDatabase()
    const result = await db.collection("cycles").insertOne({
      ...cycleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newCycle = {
      id: result.insertedId,
      ...cycleData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newCycle,
      message: "Cycle data saved successfully",
    })
  } catch (error) {
    console.error("Error saving cycle:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
