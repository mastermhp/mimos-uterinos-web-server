import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

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
    premium: true,
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
    premium: false,
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
  {
    id: 3,
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+1234567892",
    dateOfBirth: "1988-11-03",
    location: "Austin, TX",
    status: "active",
    premium: true,
    lastActive: "2024-01-13T08:20:00Z",
    joinDate: "2023-10-20T16:30:00Z",
    profile: {
      cycleLength: 26,
      periodLength: 6,
      lastPeriodDate: "2024-01-05",
      currentCycleDay: 10,
      symptoms: ["headache", "cramps", "fatigue"],
      medications: ["naproxen"],
      medicalConditions: [],
    },
    notifications: {
      periodReminder: true,
      ovulationReminder: true,
      symptomReminder: false,
      appointmentReminder: true,
    },
    notes: "Premium user, uses all features",
  },
  {
    id: 4,
    name: "Lisa Chen",
    email: "lisa.c@email.com",
    phone: "+1234567893",
    dateOfBirth: "1993-06-18",
    location: "Los Angeles, CA",
    status: "inactive",
    premium: false,
    lastActive: "2024-01-05T12:15:00Z",
    joinDate: "2023-09-10T11:45:00Z",
    profile: {
      cycleLength: 29,
      periodLength: 5,
      lastPeriodDate: "2023-12-20",
      currentCycleDay: 26,
      symptoms: ["mood_swings", "bloating"],
      medications: [],
      medicalConditions: [],
    },
    notifications: {
      periodReminder: true,
      ovulationReminder: true,
      symptomReminder: true,
      appointmentReminder: true,
    },
    notes: "Inactive user, occasional engagement",
  },
  {
    id: 5,
    name: "Anna Wilson",
    email: "anna.w@email.com",
    phone: "+1234567894",
    dateOfBirth: "1990-09-25",
    location: "Chicago, IL",
    status: "active",
    premium: true,
    lastActive: "2024-01-16T14:00:00Z",
    joinDate: "2023-08-05T10:20:00Z",
    profile: {
      cycleLength: 31,
      periodLength: 4,
      lastPeriodDate: "2024-01-10",
      currentCycleDay: 6,
      symptoms: ["cramps", "temperature"],
      medications: ["ibuprofen", "iron_supplement"],
      medicalConditions: [],
    },
    notifications: {
      periodReminder: true,
      ovulationReminder: true,
      symptomReminder: true,
      appointmentReminder: true,
    },
    notes: "Premium user, very engaged with tracking",
  },
]

export async function GET(request) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const accountType = searchParams.get("accountType") || ""
    const isActive = searchParams.get("isActive")

    const skip = (page - 1) * limit

    // Build filter
    const filter = {}

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (accountType) {
      filter.accountType = accountType
    }

    if (isActive !== null && isActive !== "") {
      filter.isActive = isActive === "true"
    }

    // Get users with pagination
    const users = await db.collection("users").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    // Get total count
    const total = await db.collection("users").countDocuments(filter)

    // Remove sensitive data
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        id: user._id.toString(),
        _id: user._id.toString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const userData = await request.json()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: userData.email,
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Prepare user document
    const newUser = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isVerified: true, // Admin created users are automatically verified
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
    }

    // Remove confirmPassword field
    delete newUser.confirmPassword

    // Insert user
    const result = await db.collection("users").insertOne(newUser)

    // Create initial user profile
    const userProfile = {
      userId: result.insertedId.toString(),
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: null,
      nextPeriodDate: null,
      symptoms: [],
      mood: [],
      flow: [],
      temperature: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("userProfiles").insertOne(userProfile)

    // TODO: Send welcome email with temporary password
    // You can implement email sending here

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: {
        id: result.insertedId.toString(),
        email: userData.email,
        name: userData.name,
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
