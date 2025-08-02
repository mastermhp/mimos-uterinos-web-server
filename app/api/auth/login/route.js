import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // For now, we'll use hardcoded admin credentials
    // In production, this should validate against a database
    if (email === "admin@mimos.com" && password === "admin123") {
      const token = jwt.sign(
        {
          id: 1,
          email: "admin@mimos.com",
          role: "admin",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" },
      )

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: 1,
          email: "admin@mimos.com",
          role: "admin",
        },
      })
    }

    // TODO: Add database validation for other admin users
    const { db } = await connectToDatabase()
    const admin = await db.collection("admins").findOne({ email })
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ id: admin._id, email: admin.email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      })
      return NextResponse.json({ success: true, token, user: { id: admin._id, email: admin.email, role: "admin" } })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
