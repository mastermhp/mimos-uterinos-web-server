// Test what password works with your current hash
const bcrypt = require("bcryptjs")
require("dotenv").config()

async function testPasswords() {
  const currentHash = process.env.ADMIN_PASSWORD_HASH // This is your hash from .env.local

  const passwordsToTest = [
    "admin123",
    "password",
    "admin",
    "mimosuterinos",
    "123456",
    "admin@123",
    "mimos123",
    "uterinos",
    "pTRZRBPNYHCN6Edg", // Your MongoDB password
    "mimosuterinos123",
    "Admin123",
    "ADMIN123",
    "admin@mimosuterinos.com",
    "test123",
    "password123",
  ]

  console.log("Testing passwords against your hash...")
  console.log("Hash:", currentHash)
  console.log("=".repeat(50))

  for (const password of passwordsToTest) {
    try {
      const isValid = await bcrypt.compare(password, currentHash)
      console.log(`Password: "${password}" -> ${isValid ? "✅ MATCH!" : "❌ No match"}`)

      if (isValid) {
        console.log(`\n🎉 FOUND IT! Your admin password is: "${password}"`)
        return password
      }
    } catch (error) {
      console.log(`Password: "${password}" -> Error: ${error.message}`)
    }
  }

  console.log("\n❌ None of the tested passwords match.")
  console.log("You'll need to generate a new password hash.")
}

testPasswords()
