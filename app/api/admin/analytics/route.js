import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"

export async function GET(request) {
  try {
    const authResult = verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    const db = await connectDB()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // User growth data
    const userGrowth = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            users: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Cycle length distribution
    const cycleData = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$cycleLength",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Symptom frequency
    const symptomFrequency = await db
      .collection("symptoms")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$symptom",
            frequency: { $sum: 1 },
          },
        },
        { $sort: { frequency: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Age distribution
    const ageDistribution = await db
      .collection("users")
      .aggregate([
        {
          $bucket: {
            groupBy: "$age",
            boundaries: [18, 25, 30, 35, 40, 45, 50],
            default: "50+",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      userGrowth: userGrowth.map((item) => ({
        date: item._id,
        users: item.users,
      })),
      cycleData: cycleData.map((item) => ({
        length: item._id,
        count: item.count,
      })),
      symptomFrequency: symptomFrequency.map((item) => ({
        symptom: item._id,
        frequency: item.frequency,
      })),
      ageDistribution: ageDistribution.map((item) => ({
        ageGroup: typeof item._id === "number" ? `${item._id}-${item._id + 4}` : item._id,
        count: item.count,
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
