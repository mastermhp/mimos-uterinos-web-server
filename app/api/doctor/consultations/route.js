import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock consultation data
const mockConsultations = [
  {
    id: 1,
    userId: 1,
    doctorId: 1,
    doctorName: "Dr. Sarah Martinez",
    type: "virtual",
    status: "scheduled",
    scheduledDate: "2024-01-20T14:00:00Z",
    duration: 30,
    reason: "Irregular periods and severe cramping",
    notes: "Patient reports irregular cycles for the past 3 months",
    prescription: null,
    followUp: null,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    userId: 2,
    doctorId: 2,
    doctorName: "Dr. Michael Chen",
    type: "in-person",
    status: "completed",
    scheduledDate: "2024-01-10T09:00:00Z",
    duration: 45,
    reason: "Routine checkup and cycle consultation",
    notes: "Normal examination, discussed cycle tracking",
    prescription: "Recommended iron supplements",
    followUp: "2024-04-10T09:00:00Z",
    createdAt: "2024-01-05T11:00:00Z",
  },
  {
    id: 3,
    userId: 3,
    doctorId: 1,
    doctorName: "Dr. Sarah Martinez",
    type: "virtual",
    status: "cancelled",
    scheduledDate: "2024-01-12T16:00:00Z",
    duration: 30,
    reason: "Severe PMS symptoms",
    notes: "Patient cancelled due to scheduling conflict",
    prescription: null,
    followUp: null,
    createdAt: "2024-01-08T14:30:00Z",
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const { db } = await connectToDatabase()
    const query = {}
    if (userId) query.userId = new ObjectId(userId)
    if (status) query.status = status
    const consultations = await db.collection("consultations").find(query).toArray()

    let filteredConsultations = consultations

    if (userId) {
      filteredConsultations = filteredConsultations.filter((c) => c.userId === Number.parseInt(userId))
    }

    if (status) {
      filteredConsultations = filteredConsultations.filter((c) => c.status === status)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedConsultations = filteredConsultations.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedConsultations,
      pagination: {
        page,
        limit,
        total: filteredConsultations.length,
        totalPages: Math.ceil(filteredConsultations.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching consultations:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const consultationData = await request.json()

    const { db } = await connectToDatabase()
    const result = await db.collection("consultations").insertOne({
      ...consultationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newConsultation = {
      id: result.insertedId,
      ...consultationData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newConsultation,
      message: "Consultation scheduled successfully",
    })
  } catch (error) {
    console.error("Error scheduling consultation:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
