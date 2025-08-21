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

    console.log(`🔍 Fetching reports for userId: ${userId}`)

    const { db } = await connectToDatabase()
    let reports = []

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format in userId field
      async () => {
        if (ObjectId.isValid(userId)) {
          console.log(`🔍 Query 1: { userId: new ObjectId('${userId}') }`)
          return await db.collection("reports").find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray()
        }
        return []
      },
      // Strategy 2: String userId
      async () => {
        console.log(`🔍 Query 2: { userId: '${userId}' }`)
        return await db.collection("reports").find({ userId: userId }).sort({ createdAt: -1 }).toArray()
      },
      // Strategy 3: Numeric userId
      async () => {
        const numericUserId = parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("reports").find({ userId: numericUserId }).sort({ createdAt: -1 }).toArray()
        }
        return []
      }
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        reports = await queryStrategies[i]()
        console.log(`✅ Found reports from database (strategy ${i + 1}): ${reports.length}`)
        if (reports.length > 0) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

    // Normalize report data
    const normalizedReports = reports.map(report => ({
      id: report._id?.toString() || report.id || Math.random().toString(36).substr(2, 9),
      userId: report.userId,
      title: report.title || "Health Report",
      type: report.type || "general",
      dateRange: report.dateRange || {},
      data: report.data || {},
      insights: report.insights || [],
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }))

    console.log(`📊 Returning ${normalizedReports.length} reports`)

    return NextResponse.json({
      success: true,
      data: normalizedReports
    })

  } catch (error) {
    console.error("❌ Error fetching reports:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, title, type, dateRange, data, insights } = body

    if (!userId || !title || !type) {
      return NextResponse.json(
        { success: false, error: "User ID, title, and type are required" },
        { status: 400 }
      )
    }

    console.log(`📝 Creating report for userId: ${userId}`)

    const { db } = await connectToDatabase()

    const newReport = {
      userId: userId.toString(),
      title,
      type,
      dateRange: dateRange || {},
      data: data || {},
      insights: insights || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection("reports").insertOne(newReport)
    
    const createdReport = {
      id: result.insertedId.toString(),
      ...newReport
    }

    console.log("✅ Report created successfully:", createdReport.id)

    return NextResponse.json({
      success: true,
      data: createdReport
    })

  } catch (error) {
    console.error("❌ Error creating report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    )
  }
}
