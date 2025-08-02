import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/database"
import { generateVerificationToken } from "@/lib/utils"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const db = await connectDB()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      salt,
      isVerified: false,
      verificationToken,
      createdAt: new Date(),
      lastActive: new Date(),
      isActive: true,
    }

    const result = await db.collection("users").insertOne(user)

    // TODO: Send verification email

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
