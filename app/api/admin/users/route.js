import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock user data with more comprehensive profiles
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1234567890",
    dateOfBirth: "1995-03-15",
    location: "New York, NY",
    status: "active",
    accountType: "premium",
    lastActive: "2024-01-15T10:30:00Z",
    joinDate: "2023-12-01T09:00:00Z",
    profile: {
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: "2024-01-01",
      currentCycleDay: 14,
      symptoms: ["cramps", "mood_swings"],
      medications: ["ibuprofen"],
      medicalConditions: [],
    },
    notifications: {
      periodReminder: true,
      ovulationReminder: true,
      symptomReminder: true,
      appointmentReminder: true,
    },
    notes: "Regular user, very engaged with tracking",
  },
  {
    id: 2,
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1234567891",
    dateOfBirth: "1992-07-22",
    location: "San Francisco, CA",
    status: "active",
    accountType: "user",
    lastActive: "2024-01-14T15:45:00Z",
    joinDate: "2023-11-15T14:20:00Z",
    profile: {
      cycleLength: 30,
      periodLength: 4,
      lastPeriodDate: "2024-01-08",
      currentCycleDay: 7,
      symptoms: ["bloating", "fatigue"],
      medications: [],
      medicalConditions: ["PCOS"],
    },
    notifications: {
      periodReminder: true,
      ovulationReminder: false,
      symptomReminder: true,
      appointmentReminder: true,
    },
    notes: "Has PCOS, irregular cycles",
  },
]

export async function GET(request) {
  try {
    console.log("🔍 Admin: Fetching all users...")
    
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 100
    const search = searchParams.get("search") || ""
    const accountType = searchParams.get("accountType") || ""
    const isActive = searchParams.get("isActive")

    const skip = (page - 1) * limit

    // Build filter
    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } }, 
        { email: { $regex: search, $options: "i" } }
      ]
    }

    if (accountType) {
      filter.accountType = accountType
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true"
    }

    console.log("🔍 Query filter:", filter)

    // Get users with pagination
    const users = await db.collection("users")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await db.collection("users").countDocuments(filter)

    console.log(`✅ Found ${users.length} users in database, ${total} total`)

    // If no users in database, return mock data for development
    let finalUsers = users
    if (users.length === 0) {
      console.log("📝 No users in database, using mock data")
      finalUsers = mockUsers.slice(skip, skip + limit)
    }

    // Normalize user data
    const normalizedUsers = finalUsers.map((user) => {
      const { password, verificationToken, resetToken, ...userWithoutSensitive } = user
      return {
        ...userWithoutSensitive,
        id: user._id?.toString() || user.id,
        _id: user._id?.toString() || user.id,
        joinDate: user.createdAt || user.joinDate,
        lastActive: user.lastLogin || user.lastActive || user.updatedAt,
        // Ensure accountType is properly set
        accountType: user.accountType || "user",
        premium: user.accountType === "premium",
      }
    })

    return NextResponse.json({
      success: true,
      data: normalizedUsers,
      users: normalizedUsers, // For compatibility
      pagination: {
        page,
        limit,
        total: users.length === 0 ? mockUsers.length : total,
        totalPages: Math.ceil((users.length === 0 ? mockUsers.length : total) / limit),
      },
    })

  } catch (error) {
    console.error("❌ Admin: Error fetching users:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch users", 
        error: error.message,
        data: [],
        users: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    console.log("🔄 Admin: Creating new user...")
    
    const { db } = await connectToDatabase()

    // Parse the request body
    let userData
    try {
      userData = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid request body" 
      }, { status: 400 })
    }

    console.log("📝 User data received:", { ...userData, password: "[HIDDEN]" })

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ 
        success: false, 
        message: "Name, email, and password are required" 
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: userData.email,
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User with this email already exists" 
      }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Prepare user document with default values for missing fields
    const newUser = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      dateOfBirth: userData.dateOfBirth || "",
      status: userData.status || "active",
      accountType: userData.accountType || "user", // This should properly handle premium
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      password: hashedPassword,
      requirePasswordChange: userData.requirePasswordChange !== undefined ? userData.requirePasswordChange : false,
      profile: userData.profile || {
        height: "",
        weight: "",
        bloodType: "",
        allergies: [],
        medications: [],
        medicalConditions: [],
        emergencyContact: {
          name: "",
          phone: "",
          relationship: "",
        },
      },
      preferences: userData.preferences || {
        notificationSettings: {
          periodReminders: true,
          medicationReminders: true,
          appointmentReminders: true,
          healthTips: true,
          emailNotifications: true,
          pushNotifications: true,
        },
        privacySettings: {
          shareDataWithDoctors: true,
          shareAnonymousData: false,
          allowResearchParticipation: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isVerified: true, // Admin created users are automatically verified
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      hasCompletedOnboarding: false,
    }

    console.log("💾 Creating user with accountType:", newUser.accountType)

    // Insert user
    const result = await db.collection("users").insertOne(newUser)

    if (!result.acknowledged) {
      throw new Error("Failed to insert user into database")
    }

    console.log("✅ Admin: User created successfully:", result.insertedId)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: {
        id: result.insertedId.toString(),
        email: userData.email,
        name: userData.name,
        accountType: newUser.accountType,
      },
    })

  } catch (error) {
    console.error("❌ Admin: Error creating user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create user", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    console.log("🔄 Admin: Updating user...")
    
    const { db } = await connectToDatabase()
    const userData = await request.json()

    if (!userData.id) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID is required" 
      }, { status: 400 })
    }

    console.log("📝 Updating user:", userData.id, "with accountType:", userData.accountType)

    // Remove password from update if it's empty
    if (userData.password === "") {
      delete userData.password
    } else if (userData.password) {
      // Hash password if provided
      const saltRounds = 12
      userData.password = await bcrypt.hash(userData.password, saltRounds)
    }

    // Remove id from update data
    const { id, _id, ...updateData } = userData

    // Add updated timestamp
    updateData.updatedAt = new Date()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    console.log("✅ Admin: User updated successfully:", id)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })

  } catch (error) {
    console.error("❌ Admin: Error updating user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update user", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    console.log("🗑️ Admin: Deleting user...")
    
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID is required" 
      }, { status: 400 })
    }

    // Delete user
    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    // Delete related data
    await Promise.all([
      db.collection("cycles").deleteMany({ userId: new ObjectId(id) }),
      db.collection("symptoms").deleteMany({ userId: new ObjectId(id) }),
      db.collection("chats").deleteMany({ userId: new ObjectId(id) }),
      db.collection("reports").deleteMany({ userId: new ObjectId(id) }),
      db.collection("consultations").deleteMany({ userId: new ObjectId(id) }),
      db.collection("healthProfiles").deleteMany({ userId: new ObjectId(id) }),
    ])

    console.log("✅ Admin: User and related data deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })

  } catch (error) {
    console.error("❌ Admin: Error deleting user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete user", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
