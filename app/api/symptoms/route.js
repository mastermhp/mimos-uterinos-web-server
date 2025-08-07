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

    console.log(`🔍 Fetching symptoms for userId: ${userId}`)

    const { db } = await connectToDatabase()
    let symptoms = []

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format in userId field
      async () => {
        if (ObjectId.isValid(userId)) {
          console.log(`🔍 Query 1: { userId: new ObjectId('${userId}') }`)
          return await db.collection("symptoms").find({ userId: new ObjectId(userId) }).sort({ date: -1 }).toArray()
        }
        return []
      },
      // Strategy 2: String userId
      async () => {
        console.log(`🔍 Query 2: { userId: '${userId}' }`)
        return await db.collection("symptoms").find({ userId: userId }).sort({ date: -1 }).toArray()
      },
      // Strategy 3: Numeric userId
      async () => {
        const numericUserId = parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("symptoms").find({ userId: numericUserId }).sort({ date: -1 }).toArray()
        }
        return []
      }
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        symptoms = await queryStrategies[i]()
        console.log(`✅ Found symptoms from database (strategy ${i + 1}): ${symptoms.length}`)
        if (symptoms.length > 0) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

    // Normalize symptom data
    const normalizedSymptoms = symptoms.map(symptom => ({
      id: symptom._id?.toString() || symptom.id || Math.random().toString(36).substr(2, 9),
      userId: symptom.userId,
      date: symptom.date,
      symptoms: symptom.symptoms || [],
      flow: symptom.flow || "none",
      mood: symptom.mood || "normal",
      temperature: symptom.temperature,
      notes: symptom.notes || "",
      createdAt: symptom.createdAt,
      updatedAt: symptom.updatedAt
    }))

    console.log(`📊 Returning ${normalizedSymptoms.length} symptoms`)

    return NextResponse.json({
      success: true,
      data: normalizedSymptoms
    })

  } catch (error) {
    console.error("❌ Error fetching symptoms:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch symptoms" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, date, symptoms, flow, mood, temperature, notes } = body

    if (!userId || !date) {
      return NextResponse.json(
        { success: false, error: "User ID and date are required" },
        { status: 400 }
      )
    }

    console.log(`📝 Creating symptom for userId: ${userId}`)

    const { db } = await connectToDatabase()

    const newSymptom = {
      userId: userId.toString(),
      date,
      symptoms: symptoms || [],
      flow: flow || "none",
      mood: mood || "normal",
      temperature: temperature || null,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection("symptoms").insertOne(newSymptom)
    
    const createdSymptom = {
      id: result.insertedId.toString(),
      ...newSymptom
    }

    console.log("✅ Symptom created successfully:", createdSymptom.id)

    return NextResponse.json({
      success: true,
      data: createdSymptom
    })

  } catch (error) {
    console.error("❌ Error creating symptom:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create symptom" },
      { status: 500 }
    )
  }
}
