import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching consultations for userId: ${userId}`)

    const { db } = await connectToDatabase()
    let consultations = []

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format in userId field
      async () => {
        if (ObjectId.isValid(userId)) {
          console.log(`🔍 Query 1: { userId: new ObjectId('${userId}') }`)
          return await db.collection("consultations").find({ userId: new ObjectId(userId) }).sort({ scheduledDate: -1 }).toArray()
        }
        return []
      },
      // Strategy 2: String userId
      async () => {
        console.log(`🔍 Query 2: { userId: '${userId}' }`)
        return await db.collection("consultations").find({ userId: userId }).sort({ scheduledDate: -1 }).toArray()
      },
      // Strategy 3: Numeric userId
      async () => {
        const numericUserId = parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("consultations").find({ userId: numericUserId }).sort({ scheduledDate: -1 }).toArray()
        }
        return []
      }
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        consultations = await queryStrategies[i]()
        console.log(`✅ Found consultations from database (strategy ${i + 1}): ${consultations.length}`)
        if (consultations.length > 0) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

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

    console.log(`📊 Returning ${normalizedConsultations.length} consultations`)

    return NextResponse.json({
      success: true,
      data: normalizedConsultations
    })

  } catch (error) {
    console.error("❌ Error fetching consultations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch consultations" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, doctorName, type, scheduledDate, duration, reason, notes } = body

    if (!userId || !doctorName || !scheduledDate) {
      return NextResponse.json(
        { success: false, error: "User ID, doctor name, and scheduled date are required" },
        { status: 400 }
      )
    }

    console.log(`📝 Creating consultation for userId: ${userId}`)

    const { db } = await connectToDatabase()

    const newConsultation = {
      userId: userId.toString(),
      doctorName,
      type: type || "general",
      scheduledDate,
      duration: duration || 30,
      reason: reason || "",
      notes: notes || "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection("consultations").insertOne(newConsultation)
    
    const createdConsultation = {
      id: result.insertedId.toString(),
      ...newConsultation
    }

    console.log("✅ Consultation created successfully:", createdConsultation.id)

    return NextResponse.json({
      success: true,
      data: createdConsultation
    })

  } catch (error) {
    console.error("❌ Error creating consultation:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create consultation" },
      { status: 500 }
    )
  }
}
