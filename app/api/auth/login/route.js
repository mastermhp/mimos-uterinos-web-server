import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log("🔐 Login attempt for:", email)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    console.log("🔄 Connecting to database...")
    const { db } = await connectToDatabase()
    console.log("✅ Database connected")

    // Find user by email (case-insensitive)
    console.log("🔍 Looking for user with email:", email)
    const user = await db.collection("users").findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    })

    if (!user) {
      console.log("❌ User not found with email:", email)

      // Check if any users exist in the database
      const userCount = await db.collection("users").countDocuments()
      console.log("📊 Total users in database:", userCount)

      if (userCount === 0) {
        console.log("⚠️ No users found in database. You may need to seed the admin user.")
      }

      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    console.log("✅ User found:", { id: user._id, email: user.email, accountType: user.accountType })

    // Verify password
    console.log("🔐 Verifying password...")
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", email)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    console.log("✅ Password verified successfully")

    const hasCompletedOnboarding =
      user.hasCompletedOnboarding || (user.profile && (user.profile.cycleLength || user.profile.lastPeriodDate))

    // Update last login
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        accountType: user.accountType || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log("✅ Login successful for:", email)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        accountType: user.accountType || "user",
        status: user.status || "active",
        hasCompletedOnboarding,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)

    // Return detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          success: false,
          message: "Server error",
          error: error.message,
          stack: error.stack,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
