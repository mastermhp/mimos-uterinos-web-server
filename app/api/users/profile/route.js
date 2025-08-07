import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Authorization token required" 
      }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired token" 
      }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(decoded.userId) },
        { projection: { password: 0, verificationToken: 0, resetToken: 0 } }
      )

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        id: user._id.toString(),
        joinedAt: user.createdAt,
      }
    })

  } catch (error) {
    console.error("❌ Error fetching user profile:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch profile" 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Authorization token required" 
      }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired token" 
      }, { status: 401 })
    }

    const updateData = await request.json()
    const { db } = await connectToDatabase()

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.email // Email changes should be handled separately
    delete updateData.verificationToken
    delete updateData.resetToken
    delete updateData.createdAt
    delete updateData._id
    delete updateData.id

    // Handle password change if provided
    if (updateData.newPassword && updateData.currentPassword) {
      // Verify current password
      const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: "User not found" 
        }, { status: 404 })
      }

      const isValidPassword = await bcrypt.compare(updateData.currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ 
          success: false, 
          message: "Current password is incorrect" 
        }, { status: 400 })
      }

      // Hash new password
      const saltRounds = 12
      updateData.password = await bcrypt.hash(updateData.newPassword, saltRounds)
      
      // Remove the plain text passwords from update data
      delete updateData.newPassword
      delete updateData.currentPassword
    }

    // Add updated timestamp
    updateData.updatedAt = new Date()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    console.log("✅ User profile updated successfully:", decoded.userId)

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("❌ Error updating user profile:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update profile" 
    }, { status: 500 })
  }
}
