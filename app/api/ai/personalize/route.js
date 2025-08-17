import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request) {
  try {
    // Get token from Authorization header
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

    const userData = await request.json()

    // Create AI personalization prompt
    const prompt = `Based on this user's health profile, provide personalized menstrual health insights and recommendations:

User Profile:
- Age: ${userData.age}
- Cycle Length: ${userData.cycleLength} days
- Period Length: ${userData.periodLength} days
- Regular Cycle: ${userData.isRegularCycle ? "Yes" : "No"}
- Common Symptoms: ${userData.symptoms.join(", ")}
- Typical Moods: ${userData.moods.join(", ")}
- Pain Level: ${["None", "Mild", "Moderate", "Severe", "Extreme"][userData.painLevel - 1]}
- Energy Level: ${["Very Low", "Low", "Moderate", "High", "Very High"][userData.energyLevel - 1]}
- Sleep Quality: ${["Very Poor", "Poor", "Fair", "Good", "Excellent"][userData.sleepQuality - 1]}

Please provide:
1. Personalized cycle insights
2. Health recommendations
3. Symptom management tips
4. Lifestyle suggestions

Keep the response concise and supportive, focusing on actionable advice.`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    const geminiData = await geminiResponse.json()
    const aiInsights =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Welcome to your personalized health journey!"

    console.log("✅ AI personalization completed for user:", decoded.userId)

    return NextResponse.json({
      success: true,
      message: "AI personalization completed",
      insights: aiInsights,
    })
  } catch (error) {
    console.error("❌ Error in AI personalization:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete AI personalization",
      },
      { status: 500 },
    )
  }
}
