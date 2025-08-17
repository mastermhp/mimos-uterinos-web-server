import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const consultations = await db
      .collection("consultations")
      .find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .toArray()

    const normalizedConsultations = consultations.map((consultation) => ({
      id: consultation._id?.toString() || consultation.id,
      userId: consultation.userId,
      symptoms: consultation.symptoms,
      severity: consultation.severity,
      duration: consultation.duration,
      notes: consultation.notes,
      status: consultation.status,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: normalizedConsultations,
    })
  } catch (error) {
    console.error("Error fetching consultations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch consultations" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, symptoms, severity, duration, notes, status } = body

    if (!userId || !symptoms) {
      return NextResponse.json({ success: false, error: "User ID and symptoms are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const newConsultation = {
      userId: userId.toString(),
      symptoms,
      severity: severity || 5,
      duration: duration || "",
      notes: notes || "",
      status: status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("consultations").insertOne(newConsultation)

    const createdConsultation = {
      id: result.insertedId.toString(),
      ...newConsultation,
    }

    return NextResponse.json({
      success: true,
      data: createdConsultation,
    })
  } catch (error) {
    console.error("Error creating consultation:", error)
    return NextResponse.json({ success: false, error: "Failed to create consultation" }, { status: 500 })
  }
}
