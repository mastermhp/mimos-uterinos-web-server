import { NextResponse } from "next/server"
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
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""

    // Replace with actual database query
    const { db } = await connectToDatabase()
    const query = search
      ? {
          $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
        }
      : {}
    const users = await db.collection("users").find(query).toArray()

    let filteredUsers = users
    if (search) {
      filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userData = await request.json()

    // Add to database
    const { db } = await connectToDatabase()
    const result = await db.collection("users").insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newUser = {
      id: result.insertedId,
      ...userData,
      status: "active",
      premium: false,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
