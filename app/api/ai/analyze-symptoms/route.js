import { NextResponse } from "next/server"
import { verifyUserToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ObjectId } from "mongodb"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function POST(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { symptoms, cycleDay, painLevel, moodLevel, energyLevel } = await request.json()

    const db = await connectDB()

    // Get user data for context
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(authResult.userId) }, { projection: { password: 0, salt: 0 } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Prepare AI prompt
    const prompt = buildSymptomAnalysisPrompt(symptoms, cycleDay, painLevel, moodLevel, energyLevel, user)

    // Call Gemini API
    const aiResponse = await callGeminiAPI(prompt)

    // Save analysis to database
    const analysis = {
      userId: authResult.userId,
      symptoms,
      cycleDay,
      painLevel,
      moodLevel,
      energyLevel,
      analysis: aiResponse,
      createdAt: new Date(),
    }

    await db.collection("symptom_analyses").insertOne(analysis)

    return NextResponse.json({
      analysis: aiResponse,
      recommendations: parseRecommendations(aiResponse),
    })
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
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

Please provide:
1. A brief analysis of these symptoms in relation to the user's current cycle phase
2. 3-5 evidence-based recommendations to help manage these symptoms
3. Any patterns or connections between these symptoms

Format your response with clear sections for "Analysis", "Recommendations", and "Patterns".
Keep your response concise, supportive, and scientifically accurate.
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

function parseRecommendations(aiResponse) {
  const recommendationsSection = aiResponse.split(/Recommendations:/i)[1]
  if (!recommendationsSection) return []

  return recommendationsSection
    .split(/\n\s*\d+\.|\n\s*-/)
    .filter((rec) => rec.trim().length > 0)
    .map((rec) => rec.trim())
    .slice(0, 5)
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
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get AI response")
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}
