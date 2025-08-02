import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const authResult = verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userData = await request.json()
    const { name, email, password, age, height, weight, cycleLength, periodLength, lastPeriodDate } = userData

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user object
    const newUser = {
      name,
      email,
      password: hashedPassword,
      age: age ? Number.parseInt(age) : null,
      height: height ? Number.parseInt(height) : null,
      weight: weight ? Number.parseInt(weight) : null,
      cycleLength: cycleLength ? Number.parseInt(cycleLength) : 28,
      periodLength: periodLength ? Number.parseInt(periodLength) : 5,
      lastPeriodDate: lastPeriodDate ? new Date(lastPeriodDate) : null,
      isVerified: true, // Admin created users are automatically verified
      isActive: true,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
      healthConditions: [],
    }

    // Insert user into database
    const result = await db.collection("users").insertOne(newUser)

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser
    userResponse._id = result.insertedId

    return NextResponse.json({
      message: "User created successfully",
      user: userResponse,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
