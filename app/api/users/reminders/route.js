import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) }, { projection: { reminders: 1 } })

    const defaultReminders = {
      dailyTime: "09:00",
      types: {
        periodStart: true,
        fertileWindow: true,
        medication: false,
        waterIntake: true,
        exercise: false,
      },
      custom: [],
    }

    return NextResponse.json({
      success: true,
      ...(user?.reminders || defaultReminders),
    })
  } catch (error) {
    console.error("❌ Error fetching reminders:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reminders",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    const reminderData = await request.json()
    const { db } = await connectToDatabase()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          reminders: reminderData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      )
    }

    await scheduleAINotifications(decoded.userId, reminderData)

    return NextResponse.json({
      success: true,
      message: "Reminders updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating reminders:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reminders",
      },
      { status: 500 },
    )
  }
}

async function scheduleAINotifications(userId, reminderSettings) {
  try {
    const { db } = await connectToDatabase()

    // Get user's latest cycle data for AI predictions
    const latestCycle = await db
      .collection("cycles")
      .findOne({ userId: new ObjectId(userId) }, { sort: { startDate: -1 } })

    if (!latestCycle) return

    const notifications = []
    const now = new Date()

    // Calculate next period prediction
    const nextPeriodDate = new Date(latestCycle.startDate)
    nextPeriodDate.setDate(nextPeriodDate.getDate() + (latestCycle.cycleLength || 28))

    // Schedule period start reminder
    if (reminderSettings.types.periodStart) {
      const reminderDate = new Date(nextPeriodDate)
      reminderDate.setDate(reminderDate.getDate() - 1) // 1 day before

      notifications.push({
        userId: new ObjectId(userId),
        type: "period_start",
        scheduledFor: reminderDate,
        message: "Your period is expected to start tomorrow. Make sure you're prepared!",
        isAI: true,
        createdAt: now,
      })
    }

    // Schedule fertile window reminder
    if (reminderSettings.types.fertileWindow) {
      const ovulationDate = new Date(latestCycle.startDate)
      ovulationDate.setDate(ovulationDate.getDate() + 14) // Approximate ovulation

      const fertileStart = new Date(ovulationDate)
      fertileStart.setDate(fertileStart.getDate() - 5)

      notifications.push({
        userId: new ObjectId(userId),
        type: "fertile_window",
        scheduledFor: fertileStart,
        message: "Your fertile window is starting. This is your most fertile time!",
        isAI: true,
        createdAt: now,
      })
    }

    // Save notifications to database
    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications)
    }
  } catch (error) {
    console.error("Error scheduling AI notifications:", error)
  }
}
