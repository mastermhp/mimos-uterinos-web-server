import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 100

    console.log(`🔍 Fetching all symptoms (admin) with limit: ${limit}`)

    const { db } = await connectToDatabase()
    
    // Fetch all symptoms from all users
    const symptoms = await db.collection("symptoms")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    console.log(`✅ Found ${symptoms.length} symptoms in database`)

    // Normalize symptom data
    const normalizedSymptoms = symptoms.map(symptom => ({
      id: symptom._id?.toString() || symptom.id || Math.random().toString(36).substr(2, 9),
      userId: symptom.userId,
      type: symptom.type || "general",
      severity: symptom.severity || "mild",
      description: symptom.description || "",
      date: symptom.date,
      tags: symptom.tags || [],
      createdAt: symptom.createdAt,
      updatedAt: symptom.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: normalizedSymptoms,
      total: normalizedSymptoms.length
    })

  } catch (error) {
    console.error("❌ Error fetching symptoms (admin):", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch symptoms" },
      { status: 500 }
    )
  }
}
