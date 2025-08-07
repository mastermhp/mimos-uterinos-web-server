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

    console.log(`🔍 Fetching cycles for userId: ${userId}`)

    const { db } = await connectToDatabase()
    let cycles = []

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format in userId field
      async () => {
        if (ObjectId.isValid(userId)) {
          console.log(`🔍 Query 1: { userId: new ObjectId('${userId}') }`)
          return await db.collection("cycles").find({ userId: new ObjectId(userId) }).sort({ startDate: -1 }).toArray()
        }
        return []
      },
      // Strategy 2: String userId
      async () => {
        console.log(`🔍 Query 2: { userId: '${userId}' }`)
        return await db.collection("cycles").find({ userId: userId }).sort({ startDate: -1 }).toArray()
      },
      // Strategy 3: Numeric userId
      async () => {
        const numericUserId = parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("cycles").find({ userId: numericUserId }).sort({ startDate: -1 }).toArray()
        }
        return []
      }
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        cycles = await queryStrategies[i]()
        console.log(`✅ Found cycles from database (strategy ${i + 1}): ${cycles.length}`)
        if (cycles.length > 0) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

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

    console.log(`📊 Returning ${normalizedCycles.length} cycles`)

    return NextResponse.json({
      success: true,
      data: normalizedCycles
    })

  } catch (error) {
    console.error("❌ Error fetching cycles:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch cycles" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, startDate, endDate, cycleLength, periodLength, flow, mood, symptoms, temperature, notes } = body

    if (!userId || !startDate) {
      return NextResponse.json(
        { success: false, error: "User ID and start date are required" },
        { status: 400 }
      )
    }

    console.log(`📝 Creating cycle for userId: ${userId}`)

    const { db } = await connectToDatabase()

    const newCycle = {
      userId: userId.toString(),
      startDate,
      endDate: endDate || null,
      cycleLength: cycleLength || 28,
      periodLength: periodLength || 5,
      flow: flow || "medium",
      mood: mood || "normal",
      symptoms: symptoms || [],
      temperature: temperature || null,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection("cycles").insertOne(newCycle)
    
    const createdCycle = {
      id: result.insertedId.toString(),
      ...newCycle
    }

    console.log("✅ Cycle created successfully:", createdCycle.id)

    return NextResponse.json({
      success: true,
      data: createdCycle
    })

  } catch (error) {
    console.error("❌ Error creating cycle:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create cycle" },
      { status: 500 }
    )
  }
}
