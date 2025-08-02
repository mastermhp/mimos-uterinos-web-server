import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs" // No longer needed for hardcoded password

// Get environment variables with fallbacks
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mimosuterinos.com"
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

// Define a hardcoded password for development purposes
const HARDCODED_ADMIN_PASSWORD = "admin123" // <<< TEMPORARY HARDCODED PASSWORD

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", { email, hasPassword: !!password })
    console.log("Expected email:", ADMIN_EMAIL)

    // Validate email
    if (email !== ADMIN_EMAIL) {
      console.log("Email mismatch")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Validate password using hardcoded value (TEMPORARY)
    if (password !== HARDCODED_ADMIN_PASSWORD) {
      console.log("Password validation failed (hardcoded check)")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password validation result: true (hardcoded check)")

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
