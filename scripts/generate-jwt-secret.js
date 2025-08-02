// Generate a secure JWT secret
const crypto = require("crypto")

function generateJWTSecret() {
  // Generate a 64-character random string
  const secret = crypto.randomBytes(32).toString("hex")

  console.log("Generated JWT Secret:")
  console.log(secret)
  console.log("\nCopy this to your .env.local file:")
  console.log(`JWT_SECRET=${secret}`)

  return secret
}

generateJWTSecret()
