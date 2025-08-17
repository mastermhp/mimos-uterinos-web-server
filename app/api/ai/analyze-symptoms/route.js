import { NextResponse } from "next/server"
import { verifyUserToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ObjectId } from "mongodb"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

export async function POST(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { symptoms, painLevel, moodLevel, energyLevel, date } = await request.json()

    const db = await connectDB()

    // Get user data for context
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(authResult.userId) }, { projection: { password: 0, salt: 0 } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const cycleDay = calculateCycleDay(user.lastPeriodDate)

    // Prepare AI prompt
    const prompt = buildSymptomAnalysisPrompt(symptoms, cycleDay, painLevel, moodLevel, energyLevel, user)

    // Call Gemini API
    const aiResponse = await callGeminiAPI(prompt)

    const symptomEntry = {
      userId: authResult.userId,
      symptoms,
      painLevel,
      moodLevel,
      energyLevel,
      cycleDay,
      date: new Date(date),
      createdAt: new Date(),
    }

    await db.collection("symptoms").insertOne(symptomEntry)

    const analysis = parseAnalysisResponse(aiResponse)

    return NextResponse.json({
      success: true,
      analysis: analysis,
    })
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

function calculateCycleDay(lastPeriodDate) {
  if (!lastPeriodDate) return 15 // Default fallback

  const lastPeriod = new Date(lastPeriodDate)
  const today = new Date()
  const diffTime = Math.abs(today - lastPeriod)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function buildSymptomAnalysisPrompt(symptoms, cycleDay, painLevel, moodLevel, energyLevel, user) {
  const currentPhase = determineCyclePhase(cycleDay, user.cycleLength, user.periodLength)

  return `
You are a menstrual health AI assistant analyzing symptoms for a user.

User Data:
- Age: ${user.age}
- Current cycle day: ${cycleDay}
- Current phase: ${currentPhase}
- Cycle length: ${user.cycleLength} days
- Period length: ${user.periodLength} days

Symptoms reported:
${symptoms.map((s) => `- ${s}`).join("\n")}

Additional data:
- Pain level: ${painLevel}/10
- Mood level: ${moodLevel}/10
- Energy level: ${energyLevel}/10

Please provide a comprehensive analysis with specific recommendations for managing these symptoms during the ${currentPhase} phase.

Include:
1. Analysis of symptoms in relation to current cycle phase
2. Specific recommendations for pain relief, mood management, dietary adjustments, and exercise
3. When to consider consulting a healthcare provider

Format your response as a detailed analysis that explains the symptoms and provides actionable advice.
Keep your response supportive, evidence-based, and focused on menstrual health.
`
}

function determineCyclePhase(cycleDay, cycleLength, periodLength) {
  if (cycleDay <= periodLength) {
    return "Period"
  } else if (cycleDay <= cycleLength / 2) {
    return "Follicular"
  } else if (cycleDay === Math.round(cycleLength / 2)) {
    return "Ovulation"
  } else {
    return "Luteal"
  }
}

function parseAnalysisResponse(aiResponse) {
  return {
    summary: aiResponse.substring(0, 200) + "...", // First part as summary
    recommendations: [
      "Apply heat therapy for cramps relief",
      "Practice mindfulness for mood management",
      "Focus on magnesium-rich foods",
      "Get adequate rest and sleep",
    ],
  }
}

async function callGeminiAPI(prompt) {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 2048, // Increased token limit for detailed analysis
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get AI response")
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid AI response format")
  }

  return data.candidates[0].content.parts[0].text
}
