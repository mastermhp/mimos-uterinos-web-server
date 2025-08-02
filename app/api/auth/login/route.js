import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Get environment variables with fallbacks
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mimosuterinos.com"
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || "$2b$10$SfAdh/EpOe0nk9zt7AEu1OeHm6mZ3uAsUXzElsi2d5o6cZCzLRD22"
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", { email, hasPassword: !!password })
    console.log("Expected email:", ADMIN_EMAIL)
    console.log("Has password hash:", !!ADMIN_PASSWORD_HASH)

    // Validate email first
    if (email !== ADMIN_EMAIL) {
      console.log("Email mismatch")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    console.log("Password validation result:", isValidPassword)

    if (!isValidPassword) {
      console.log("Password validation failed")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email,
        role: "admin",
        timestamp: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("Login successful for:", email)

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        email,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
