import { NextResponse } from "next/server"
import { verifyUserToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(authResult.userId) },
        { projection: { password: 0, salt: 0, verificationToken: 0, resetToken: 0 } },
      )

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Remove sensitive fields
    delete updateData.password
    delete updateData.salt
    delete updateData.verificationToken
    delete updateData.resetToken

    const db = await connectDB()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(authResult.userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
