import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 100

    console.log(`🔍 Fetching all consultations (admin) with limit: ${limit}`)

    const { db } = await connectToDatabase()
    
    // Fetch all consultations from all users
    const consultations = await db.collection("consultations")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    console.log(`✅ Found ${consultations.length} consultations in database`)

    // Normalize consultation data
    const normalizedConsultations = consultations.map(consultation => ({
      id: consultation._id?.toString() || consultation.id || Math.random().toString(36).substr(2, 9),
      userId: consultation.userId,
      doctorName: consultation.doctorName || "Dr. Unknown",
      type: consultation.type || "general",
      scheduledDate: consultation.scheduledDate,
      duration: consultation.duration || 30,
      reason: consultation.reason || "",
      notes: consultation.notes || "",
      status: consultation.status || "scheduled",
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: normalizedConsultations,
      total: normalizedConsultations.length
    })

  } catch (error) {
    console.error("❌ Error fetching consultations (admin):", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch consultations" },
      { status: 500 }
    )
  }
}
