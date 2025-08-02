import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock symptoms data
const mockSymptoms = [
  {
    id: 1,
    userId: 1,
    date: "2024-01-15",
    symptoms: [
      { type: "cramps", severity: "moderate", notes: "Lower abdominal pain" },
      { type: "mood_swings", severity: "mild", notes: "Feeling irritable" },
      { type: "bloating", severity: "mild", notes: "Slight abdominal bloating" },
    ],
    flow: "medium",
    mood: "irritable",
    temperature: 98.6,
    notes: "Day 2 of period",
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: 2,
    userId: 1,
    date: "2024-01-14",
    symptoms: [
      { type: "cramps", severity: "severe", notes: "Intense cramping" },
      { type: "headache", severity: "moderate", notes: "Tension headache" },
    ],
    flow: "heavy",
    mood: "sad",
    temperature: 98.4,
    notes: "First day of period",
    createdAt: "2024-01-14T08:30:00Z",
  },
  {
    id: 3,
    userId: 2,
    date: "2024-01-13",
    symptoms: [
      { type: "bloating", severity: "moderate", notes: "Abdominal discomfort" },
      { type: "fatigue", severity: "mild", notes: "Feeling tired" },
    ],
    flow: "light",
    mood: "normal",
    temperature: 98.2,
    notes: "Pre-period symptoms",
    createdAt: "2024-01-13T07:45:00Z",
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const { db } = await connectToDatabase()
    const query = {}
    if (userId) query.userId = new ObjectId(userId)
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }
    const symptoms = await db.collection("symptoms").find(query).toArray()

    let filteredSymptoms = symptoms

    if (userId) {
      filteredSymptoms = filteredSymptoms.filter((s) => s.userId === Number.parseInt(userId))
    }

    if (startDate) {
      filteredSymptoms = filteredSymptoms.filter((s) => s.date >= startDate)
    }

    if (endDate) {
      filteredSymptoms = filteredSymptoms.filter((s) => s.date <= endDate)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSymptoms = filteredSymptoms.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedSymptoms,
      pagination: {
        page,
        limit,
        total: filteredSymptoms.length,
        totalPages: Math.ceil(filteredSymptoms.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching symptoms:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const symptomData = await request.json()

    const { db } = await connectToDatabase()
    const result = await db.collection("symptoms").insertOne({
      ...symptomData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newSymptom = {
      id: result.insertedId,
      ...symptomData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newSymptom,
      message: "Symptoms logged successfully",
    })
  } catch (error) {
    console.error("Error logging symptoms:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
