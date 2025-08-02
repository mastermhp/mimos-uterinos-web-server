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
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const skip = (page - 1) * limit

    const db = await connectDB()

    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            password: 0,
            salt: 0,
            verificationToken: 0,
            resetToken: 0,
          },
        },
      )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()

    const total = await db.collection("users").countDocuments()

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
