// Run this script to generate admin password hash
const bcrypt = require("bcryptjs")

async function generateAdminPassword() {
  const password = process.argv[2] || "admin123"

  console.log(`Generating hash for password: "${password}"`)

  const hash = await bcrypt.hash(password, 10)
  console.log("\nGenerated Password Hash:")
  console.log(hash)
  console.log("\nCopy this to your .env.local file:")
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)

  // Test the hash
  const isValid = await bcrypt.compare(password, hash)
  console.log(`\nPassword verification test: ${isValid ? "PASSED" : "FAILED"}`)

  // Test with your current hash
  const currentHash = "$2b$10$SfAdh/EpOe0nk9zt7AEu1OeHm6mZ3uAsUXzElsi2d5o6cZCzLRD22"
  const testCurrent = await bcrypt.compare(password, currentHash)
  console.log(`Test against your current hash: ${testCurrent ? "PASSED" : "FAILED"}`)
}

generateAdminPassword()
