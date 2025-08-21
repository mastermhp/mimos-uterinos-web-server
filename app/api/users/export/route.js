import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(decoded.userId)

    // Fetch all user data
    const user = await db
      .collection("users")
      .findOne({ _id: userId }, { projection: { password: 0, verificationToken: 0, resetToken: 0 } })

    const cycles = await db.collection("cycles").find({ userId }).sort({ startDate: -1 }).toArray()

    const symptoms = await db.collection("symptoms").find({ userId }).sort({ date: -1 }).toArray()

    const chats = await db.collection("chats").find({ userId }).sort({ createdAt: -1 }).toArray()

    const consultations = await db.collection("consultations").find({ userId }).sort({ createdAt: -1 }).toArray()

    // Compile export data
    const exportData = {
      user: {
        ...user,
        id: user._id.toString(),
      },
      cycles: cycles.map((cycle) => ({
        ...cycle,
        id: cycle._id.toString(),
        userId: cycle.userId.toString(),
      })),
      symptoms: symptoms.map((symptom) => ({
        ...symptom,
        id: symptom._id.toString(),
        userId: symptom.userId.toString(),
      })),
      chats: chats.map((chat) => ({
        ...chat,
        id: chat._id.toString(),
        userId: chat.userId.toString(),
      })),
      consultations: consultations.map((consultation) => ({
        ...consultation,
        id: consultation._id.toString(),
        userId: consultation.userId.toString(),
      })),
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    }

    // Create JSON response
    const jsonData = JSON.stringify(exportData, null, 2)

    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mimos-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("❌ Error exporting user data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export data",
      },
      { status: 500 },
    )
  }
}
