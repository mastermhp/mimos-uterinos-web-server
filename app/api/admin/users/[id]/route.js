import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const authResult = verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { password: 0, salt: 0, verificationToken: 0, resetToken: 0 } },
      )

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()

    // Delete user and all related data
    await Promise.all([
      db.collection("users").deleteOne({ _id: new ObjectId(params.id) }),
      db.collection("cycles").deleteMany({ userId: params.id }),
      db.collection("symptoms").deleteMany({ userId: params.id }),
      db.collection("moods").deleteMany({ userId: params.id }),
      db.collection("notes").deleteMany({ userId: params.id }),
    ])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
