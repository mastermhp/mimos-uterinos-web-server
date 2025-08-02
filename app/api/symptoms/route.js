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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    const db = await connectDB()

    const query = { userId: authResult.userId }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const symptoms = await db.collection("symptoms").find(query).sort({ date: -1 }).limit(limit).toArray()

    return NextResponse.json({ symptoms })
  } catch (error) {
    console.error("Error fetching symptoms:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const symptomData = await request.json()

    const db = await connectDB()

    const symptom = {
      ...symptomData,
      userId: authResult.userId,
      createdAt: new Date(),
    }

    const result = await db.collection("symptoms").insertOne(symptom)

    return NextResponse.json(
      {
        message: "Symptom logged successfully",
        symptomId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error logging symptom:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
