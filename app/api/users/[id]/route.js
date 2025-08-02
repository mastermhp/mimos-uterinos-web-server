import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock user data - same as in users/route.js
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1234567890",
    dateOfBirth: "1995-03-15",
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
    },
  },
]

export async function GET(request, { params }) {
  try {
    const userId = Number.parseInt(params.id)

    // Replace with database query
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(params.id) })

    // const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = Number.parseInt(params.id)
    const updateData = await request.json()

    // Replace with database update
    const { db } = await connectToDatabase()
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...updateData, updatedAt: new Date() } })

    // const userIndex = mockUsers.findIndex((u) => u.id === userId)

    // if (userIndex === -1) {
    //   return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    // }

    // mockUsers[userIndex] = { ...mockUsers[userIndex], ...updateData }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = Number.parseInt(params.id)

    // Replace with database deletion
    const { db } = await connectToDatabase()
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(params.id) })

    // const userIndex = mockUsers.findIndex((u) => u.id === userId)

    // if (userIndex === -1) {
    //   return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    // }

    // mockUsers.splice(userIndex, 1)

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
