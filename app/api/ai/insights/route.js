import { NextResponse } from "next/server"
import { verifyUserToken } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ObjectId } from "mongodb"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function GET(request) {
  try {
    const authResult = verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()

    // Get user data
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(authResult.userId) }, { projection: { password: 0, salt: 0 } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get recent symptoms and cycles for context
    const recentSymptoms = await db
      .collection("symptoms")
      .find({ userId: authResult.userId })
      .sort({ date: -1 })
      .limit(10)
      .toArray()

    const recentCycles = await db
      .collection("cycles")
      .find({ userId: authResult.userId })
      .sort({ startDate: -1 })
      .limit(3)
      .toArray()

    // Build insights prompt
    const prompt = buildInsightsPrompt(user, recentSymptoms, recentCycles)

    // Call Gemini API
    const aiResponse = await callGeminiAPI(prompt)

    // Parse insights
    const insights = parseInsights(aiResponse)

    // Save insights to database
    const insightRecord = {
      userId: authResult.userId,
      insights,
      rawResponse: aiResponse,
      createdAt: new Date(),
    }

    await db.collection("daily_insights").insertOne(insightRecord)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function buildInsightsPrompt(user, recentSymptoms, recentCycles) {
  const today = new Date()
  const daysSinceLastPeriod = Math.floor((today - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24))
  const cycleDay = (daysSinceLastPeriod % user.cycleLength) + 1
  const currentPhase = determineCyclePhase(cycleDay, user.cycleLength, user.periodLength)

  return `
You are a menstrual health AI assistant providing personalized daily insights.

User Data:
- Name: ${user.name}
- Age: ${user.age}
- Current cycle day: ${cycleDay}
- Current phase: ${currentPhase}
- Cycle length: ${user.cycleLength} days
- Period length: ${user.periodLength} days

Recent Symptoms:
${recentSymptoms.map((s) => `- ${s.symptom} (${s.severity}/10) on ${new Date(s.date).toDateString()}`).join("\n")}

Recent Cycles:
${recentCycles.map((c) => `- Started ${new Date(c.startDate).toDateString()}, lasted ${c.length} days`).join("\n")}

Please provide 3-5 helpful, evidence-based insights for today based on the user's data.
Focus on:
1. Physical well-being during this phase
2. Emotional well-being during this phase
3. Nutrition recommendations for this phase
4. Exercise recommendations for this phase
5. Self-care tips for this phase

Format your response as a numbered list of insights. Each insight should be 1-2 sentences and be supportive and scientifically accurate.
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

function parseInsights(aiResponse) {
  return aiResponse
    .split("\n")
    .filter((line) => line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((insight) => insight.length > 0)
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
