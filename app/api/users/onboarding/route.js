import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Authorization token required" 
      }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired token" 
      }, { status: 401 })
    }

    const onboardingData = await request.json()
    const {
      name,
      birthDate,
      age,
      weight,
      height,
      periodLength,
      isRegularCycle,
      cycleLength,
      lastPeriodDate,
      goals,
      email,
      healthConditions,
      symptoms,
      moods,
      notes
    } = onboardingData

    console.log(`📝 Processing onboarding for user: ${decoded.userId}`)

    const { db } = await connectToDatabase()

    // Update user profile with onboarding data
    const profileUpdate = {
      name: name || undefined,
      profile: {
        birthDate,
        age,
        weight,
        height,
        periodLength,
        isRegularCycle,
        cycleLength,
        lastPeriodDate,
        healthConditions: healthConditions || [],
        goals: goals || []
      },
      hasCompletedOnboarding: true,
      updatedAt: new Date()
    }

    // Remove undefined values
    Object.keys(profileUpdate).forEach(key => 
      profileUpdate[key] === undefined && delete profileUpdate[key]
    )

    const userResult = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: profileUpdate }
    )

    if (userResult.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 })
    }

    // Create initial cycle record if lastPeriodDate is provided
    if (lastPeriodDate) {
      const cycleData = {
        userId: decoded.userId,
        startDate: lastPeriodDate,
        endDate: null,
        cycleLength: cycleLength || 28,
        periodLength: periodLength || 5,
        flow: "medium",
        mood: "normal",
        symptoms: symptoms || [],
        temperature: null,
        notes: notes || "",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection("cycles").insertOne(cycleData)
    }

    // Store symptoms data if provided
    if (symptoms && symptoms.length > 0) {
      const symptomRecords = symptoms.map(symptom => ({
        userId: decoded.userId,
        name: symptom.name,
        intensity: symptom.intensity || 1,
        date: symptom.date || new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      await db.collection("symptoms").insertMany(symptomRecords)
    }

    // Store mood data if provided
    if (moods && moods.length > 0) {
      const moodRecords = moods.map(mood => ({
        userId: decoded.userId,
        name: mood.name,
        intensity: mood.intensity || 1,
        date: mood.date || new Date().toISOString(),
        type: "mood",
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      await db.collection("symptoms").insertMany(moodRecords)
    }

    console.log("✅ Onboarding completed successfully for user:", decoded.userId)

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully"
    })

  } catch (error) {
    console.error("❌ Error processing onboarding:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to complete onboarding"
    }, { status: 500 })
  }
}
