import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 100

    console.log(`🔍 Fetching all reports (admin) with limit: ${limit}`)

    const { db } = await connectToDatabase()
    
    // Fetch all reports from all users
    const reports = await db.collection("reports")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    console.log(`✅ Found ${reports.length} reports in database`)

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

    return NextResponse.json({
      success: true,
      data: normalizedReports,
      total: normalizedReports.length
    })

  } catch (error) {
    console.error("❌ Error fetching reports (admin):", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}
