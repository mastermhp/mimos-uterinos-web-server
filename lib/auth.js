import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function verifyToken(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided" }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)

    return { success: true, ...decoded }
  } catch (error) {
    return { success: false, message: "Invalid token" }
  }
}

export function verifyUserToken(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided" }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded.userId) {
      return { success: false, message: "Invalid user token" }
    }

    return { success: true, userId: decoded.userId, email: decoded.email }
  } catch (error) {
    return { success: false, message: "Invalid token" }
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" })
}
