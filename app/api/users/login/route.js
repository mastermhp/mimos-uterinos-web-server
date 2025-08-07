import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required"
      }, { status: 400 })
    }

    console.log(`🔐 Login attempt for: ${email}`)

    const { db } = await connectToDatabase()

    // Find user
    const user = await db.collection("users").findOne({ 
      email: email.toLowerCase() 
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json({
        success: false,
        message: "Account is not active"
      }, { status: 403 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        accountType: user.accountType || "user"
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    )

    console.log("✅ User logged in successfully:", user._id.toString())

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          accountType: user.accountType || "user",
          hasCompletedOnboarding: user.hasCompletedOnboarding || false,
          profile: user.profile || {},
          preferences: user.preferences || {}
        }
      }
    })

  } catch (error) {
    console.error("❌ Error logging in user:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to login"
    }, { status: 500 })
  }
}
