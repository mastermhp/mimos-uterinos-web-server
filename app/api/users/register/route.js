import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Name, email, and password are required"
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 6 characters long"
      }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address"
      }, { status: 400 })
    }

    console.log(`📝 Registering new user: ${email}`)

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists"
      }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      accountType: "user",
      status: "active",
      hasCompletedOnboarding: false,
      profile: {},
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("users").insertOne(newUser)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId.toString(),
        email: email.toLowerCase(),
        accountType: "user"
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    )

    console.log("✅ User registered successfully:", result.insertedId.toString())

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: result.insertedId.toString(),
          name,
          email: email.toLowerCase(),
          accountType: "user",
          hasCompletedOnboarding: false
        }
      }
    })

  } catch (error) {
    console.error("❌ Error registering user:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to register user"
    }, { status: 500 })
  }
}
