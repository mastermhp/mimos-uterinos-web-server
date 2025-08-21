import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

// Mock user data for fallback
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-0123",
    dateOfBirth: "1990-05-15",
    joinedAt: "2024-01-01T00:00:00Z",
    status: "active",
    accountType: "premium"
  },
  {
    id: 2,
    name: "Emily Davis",
    email: "emily@example.com", 
    phone: "555-0124",
    dateOfBirth: "1992-08-22",
    joinedAt: "2024-01-02T00:00:00Z",
    status: "active",
    accountType: "user"
  }
]

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    console.log(`🔍 Fetching user with ID: ${userId}`)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    let user = null

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format
      () => {
        console.log(`🔍 Query 1: { _id: new ObjectId('${userId}') }`)
        return db.collection("users").findOne({ _id: new ObjectId(userId) })
      },
      // Strategy 2: String _id
      () => {
        console.log(`🔍 Query 2: { _id: '${userId}' }`)
        return db.collection("users").findOne({ _id: userId })
      },
      // Strategy 3: Numeric id field
      () => {
        console.log(`🔍 Query 3: { id: ${parseInt(userId)} }`)
        return db.collection("users").findOne({ id: parseInt(userId) })
      }
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        user = await queryStrategies[i]()
        console.log(`✅ Found user from database (strategy ${i + 1}):`, user ? 'Yes' : 'No')
        if (user) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

    // Fallback to mock data if no user found
    if (!user) {
      console.log("🔍 No user in database, checking mock data...")
      user = mockUsers.find(u => 
        u.id === parseInt(userId) || 
        u.id.toString() === userId
      )
      console.log(`✅ Found mock user:`, user ? 'Yes' : 'No')
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Normalize user data
    const normalizedUser = {
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      joinedAt: user.createdAt || user.joinedAt,
      status: user.status || "active",
      accountType: user.accountType || "user",
      profile: user.profile || {},
      preferences: user.preferences || {},
      hasCompletedOnboarding: user.hasCompletedOnboarding || false,
    }

    console.log("✅ User fetched successfully:", normalizedUser.id)

    return NextResponse.json({
      success: true,
      data: normalizedUser
    })

  } catch (error) {
    console.error("❌ Error fetching user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    console.log(`📝 Updating user with ID: ${userId}`)

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    const { db } = await connectToDatabase()

    // Remove sensitive fields that shouldn't be updated
    delete updateData._id
    delete updateData.id
    delete updateData.createdAt

    // Handle password update if provided
    if (updateData.password) {
      const saltRounds = 12
      updateData.password = await bcrypt.hash(updateData.password, saltRounds)
    }

    // Add updated timestamp
    updateData.updatedAt = new Date()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    console.log("✅ User updated successfully:", userId)

    return NextResponse.json({
      success: true,
      message: "User updated successfully"
    })

  } catch (error) {
    console.error("❌ Error updating user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    console.log(`🗑️ Deleting user with ID: ${userId}`)

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Delete user
    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(userId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Delete related data
    await Promise.all([
      db.collection("cycles").deleteMany({ userId: new ObjectId(userId) }),
      db.collection("symptoms").deleteMany({ userId: new ObjectId(userId) }),
      db.collection("chats").deleteMany({ userId: new ObjectId(userId) }),
      db.collection("reports").deleteMany({ userId: new ObjectId(userId) }),
      db.collection("consultations").deleteMany({ userId: new ObjectId(userId) }),
      db.collection("healthProfiles").deleteMany({ userId: new ObjectId(userId) }),
    ])

    console.log("✅ User and related data deleted successfully:", userId)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    )
  }
}
