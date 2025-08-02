import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    const jwtSecret = process.env.JWT_SECRET

    // Test common passwords against the hash
    const testPasswords = ["admin123", "password", "admin", "mimosuterinos"]
    const passwordTests = {}

    for (const pwd of testPasswords) {
      try {
        passwordTests[pwd] = await bcrypt.compare(pwd, adminPasswordHash)
      } catch (error) {
        passwordTests[pwd] = `Error: ${error.message}`
      }
    }

    return NextResponse.json({
      environment: {
        hasAdminEmail: !!adminEmail,
        adminEmail: adminEmail,
        hasPasswordHash: !!adminPasswordHash,
        passwordHashLength: adminPasswordHash?.length,
        hasJwtSecret: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length,
      },
      passwordTests,
      message: "Check which password works with your hash",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        message: "Error testing environment",
      },
      { status: 500 },
    )
  }
}
