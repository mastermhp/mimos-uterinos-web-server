import { NextResponse } from "next/server"
import { verifyUserToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"

export async function GET(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const db = await connectDB()

    const cycles = await db
      .collection("cycles")
      .find({ userId: authResult.userId })
      .sort({ startDate: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ cycles })
  } catch (error) {
    console.error("Error fetching cycles:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const cycleData = await request.json()

    const db = await connectDB()

    const cycle = {
      ...cycleData,
      userId: authResult.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("cycles").insertOne(cycle)

    return NextResponse.json(
      {
        message: "Cycle logged successfully",
        cycleId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error logging cycle:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
