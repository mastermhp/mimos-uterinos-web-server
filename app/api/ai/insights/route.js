// import { NextResponse } from "next/server"
// import { verifyUserToken } from "@/lib/auth"
// import { connectDB } from "@/lib/database"
// import { ObjectId } from "mongodb"

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

// export async function GET(request) {
//   try {
//     const authResult = verifyUserToken(request)
//     if (!authResult.success) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const db = await connectDB()

//     // Get user data
//     const user = await db
//       .collection("users")
//       .findOne({ _id: new ObjectId(authResult.userId) }, { projection: { password: 0, salt: 0 } })

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 })
//     }

//     // Get recent symptoms and cycles for context
//     const recentSymptoms = await db
//       .collection("symptoms")
//       .find({ userId: authResult.userId })
//       .sort({ date: -1 })
//       .limit(10)
//       .toArray()

//     const recentCycles = await db
//       .collection("cycles")
//       .find({ userId: authResult.userId })
//       .sort({ startDate: -1 })
//       .limit(3)
//       .toArray()

//     const prompt = buildComprehensivePrompt(user, recentSymptoms, recentCycles)

//     // Call Gemini API
//     const aiResponse = await callGeminiAPI(prompt)

//     const parsedResponse = parseStructuredResponse(aiResponse)

//     // Save insights to database
//     const insightRecord = {
//       userId: authResult.userId,
//       ...parsedResponse,
//       rawResponse: aiResponse,
//       createdAt: new Date(),
//     }

//     await db.collection("daily_insights").insertOne(insightRecord)

//     return NextResponse.json({
//       success: true,
//       insights: parsedResponse.insights,
//       cyclePredictions: parsedResponse.cyclePredictions,
//       recommendations: parsedResponse.recommendations,
//     })
//   } catch (error) {
//     console.error("Error generating insights:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }

// function buildComprehensivePrompt(user, recentSymptoms, recentCycles) {
//   const today = new Date()
//   const daysSinceLastPeriod = user.lastPeriodDate
//     ? Math.floor((today - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24))
//     : 15
//   const cycleDay = (daysSinceLastPeriod % (user.cycleLength || 28)) + 1
//   const currentPhase = determineCyclePhase(cycleDay, user.cycleLength || 28, user.periodLength || 4)

//   return `
// You are a menstrual health AI assistant providing personalized daily insights for ${user.name}.

// User Profile:
// - Name: ${user.name}
// - Age: ${user.age || 25}
// - Current cycle day: ${cycleDay}
// - Current phase: ${currentPhase}
// - Cycle length: ${user.cycleLength || 28} days
// - Period length: ${user.periodLength || 4} days
// - Height: ${user.height || 165}cm, Weight: ${user.weight || 60}kg
// - Pain level: ${user.painLevel || 3}/5
// - Energy level: ${user.energyLevel || 4}/5
// - Sleep quality: ${user.sleepQuality || 3}/5

// Recent Symptoms:
// ${
//   recentSymptoms.length > 0
//     ? recentSymptoms.map((s) => `- ${s.symptom} (${s.severity}/10) on ${new Date(s.date).toDateString()}`).join("\n")
//     : "- No recent symptoms logged"
// }

// Recent Cycles:
// ${
//   recentCycles.length > 0
//     ? recentCycles.map((c) => `- Started ${new Date(c.startDate).toDateString()}, lasted ${c.length} days`).join("\n")
//     : "- No recent cycle data available"
// }

// Please provide a comprehensive response in the following JSON format:

// {
//   "insights": "Hello ${user.name}! Here are some personalized insights for you today (cycle day ${cycleDay}, ${currentPhase} phase): **Physical Well-being:** [specific advice for current phase] **Emotional Well-being:** [specific advice for mood/emotional state during this phase]",
//   "cyclePredictions": "[Specific predictions about fertile window, next period, or cycle patterns based on current phase and data]",
//   "recommendations": [
//     {
//       "category": "Nutrition",
//       "text": "[Specific nutrition advice for current cycle phase]"
//     },
//     {
//       "category": "Exercise", 
//       "text": "[Specific exercise recommendations for current phase]"
//     },
//     {
//       "category": "Sleep",
//       "text": "[Sleep advice based on current phase and user's sleep quality]"
//     },
//     {
//       "category": "Self-Care",
//       "text": "[Self-care recommendations for current phase and symptoms]"
//     }
//   ]
// }

// Make all advice specific to the ${currentPhase} phase and personalized based on the user's data. Be supportive, scientifically accurate, and helpful.
// `
// }

// function determineCyclePhase(cycleDay, cycleLength, periodLength) {
//   if (cycleDay <= periodLength) {
//     return "menstrual"
//   } else if (cycleDay <= cycleLength / 2) {
//     return "follicular"
//   } else if (cycleDay === Math.round(cycleLength / 2)) {
//     return "ovulation"
//   } else {
//     return "luteal"
//   }
// }

// function parseStructuredResponse(aiResponse) {
//   try {
//     console.log("[v0] Raw AI response length:", aiResponse.length)
//     console.log("[v0] Raw AI response preview:", aiResponse.substring(0, 200))

//     const cleanResponse = aiResponse
//       .replace(/```json\n?/g, "")
//       .replace(/```\n?/g, "")
//       .trim()

//     // Try to find the start of JSON
//     const jsonStart = cleanResponse.indexOf("{")
//     if (jsonStart === -1) {
//       throw new Error("No JSON object found in response")
//     }

//     // Extract from JSON start to end, handling potential truncation
//     let jsonStr = cleanResponse.substring(jsonStart)

//     // If the response seems truncated (doesn't end with }), try to complete it
//     if (!jsonStr.trim().endsWith("}")) {
//       console.log("[v0] Response appears truncated, attempting to complete JSON structure")

//       // Count open braces to determine how many closes we need
//       const openBraces = (jsonStr.match(/\{/g) || []).length
//       const closeBraces = (jsonStr.match(/\}/g) || []).length
//       const missingBraces = openBraces - closeBraces

//       // If we're in the middle of a string, close it
//       const openQuotes = (jsonStr.match(/"/g) || []).length
//       if (openQuotes % 2 !== 0) {
//         jsonStr += '"'
//       }

//       // If we're in an array, close it
//       const openBrackets = (jsonStr.match(/\[/g) || []).length
//       const closeBrackets = (jsonStr.match(/\]/g) || []).length
//       const missingBrackets = openBrackets - closeBrackets

//       // Add missing closing brackets and braces
//       jsonStr += "]".repeat(missingBrackets)
//       jsonStr += "}".repeat(missingBraces)
//     }

//     // Clean up common JSON formatting issues
//     const cleanedJson = jsonStr
//       .replace(/,\s*}/g, "}") // Remove trailing commas
//       .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
//       .replace(/\n/g, " ") // Replace newlines with spaces
//       .replace(/\s+/g, " ") // Normalize whitespace
//       .trim()

//     console.log("[v0] Attempting to parse cleaned JSON:", cleanedJson.substring(0, 200))
//     const parsed = JSON.parse(cleanedJson)

//     return {
//       insights: parsed.insights || "Personalized insights based on your cycle data.",
//       cyclePredictions:
//         parsed.cyclePredictions ||
//         "Predictions improve with more cycle data. Log your periods regularly for better accuracy.",
//       recommendations: Array.isArray(parsed.recommendations)
//         ? parsed.recommendations
//         : [
//             {
//               category: "Nutrition",
//               text: "Focus on iron-rich foods and stay hydrated during your cycle.",
//             },
//             {
//               category: "Exercise",
//               text: "Light exercise like walking or yoga can help with cycle symptoms.",
//             },
//             {
//               category: "Sleep",
//               text: "Maintain consistent sleep schedule for better hormonal balance.",
//             },
//             {
//               category: "Self-Care",
//               text: "Practice stress management and listen to your body's needs.",
//             },
//           ],
//     }
//   } catch (error) {
//     console.error("Error parsing AI response:", error)
//     console.log("Raw AI response:", aiResponse.substring(0, 500))

//     const extractedInsights = extractInsightsFromText(aiResponse)
//     return extractedInsights
//   }
// }

// function extractInsightsFromText(rawText) {
//   // Try to extract meaningful content even if JSON parsing fails
//   const lines = rawText.split("\n").filter((line) => line.trim())

//   let insights = "Personalized insights based on your cycle data."
//   const cyclePredictions = "Predictions improve with more cycle data. Log your periods regularly for better accuracy."

//   // Look for insights in the raw text
//   const insightMatch = rawText.match(/insights['"]\s*:\s*['"]([^'"]+)/i)
//   if (insightMatch) {
//     insights = insightMatch[1]
//   } else if (rawText.includes("Physical Well-being") || rawText.includes("Emotional Well-being")) {
//     // Extract the first meaningful paragraph
//     const meaningfulText = rawText
//       .substring(0, 400)
//       .replace(/[{}"[\]]/g, "")
//       .trim()
//     if (meaningfulText.length > 50) {
//       insights = meaningfulText + "..."
//     }
//   }

//   return {
//     insights,
//     cyclePredictions,
//     recommendations: [
//       {
//         category: "Nutrition",
//         text: "Focus on iron-rich foods and stay hydrated during your cycle.",
//       },
//       {
//         category: "Exercise",
//         text: "Light exercise like walking or yoga can help with cycle symptoms.",
//       },
//       {
//         category: "Sleep",
//         text: "Maintain consistent sleep schedule for better hormonal balance.",
//       },
//       {
//         category: "Self-Care",
//         text: "Practice stress management and listen to your body's needs.",
//       },
//     ],
//   }
// }

// async function callGeminiAPI(prompt, retryCount = 0) {
//   const maxRetries = 3

//   try {
//     console.log(`[v0] Calling Gemini API (attempt ${retryCount + 1}/${maxRetries + 1})`)

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.4,
//           topK: 32,
//           topP: 0.95,
//           maxOutputTokens: 4096,
//         },
//       }),
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error(`[v0] Gemini API error (${response.status}):`, errorText)

//       // If it's a rate limit error (429) or server error (5xx), retry
//       if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
//         const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
//         console.log(`[v0] Retrying after ${delay}ms...`)
//         await new Promise((resolve) => setTimeout(resolve, delay))
//         return callGeminiAPI(prompt, retryCount + 1)
//       }

//       throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`)
//     }

//     const data = await response.json()
//     console.log("[v0] Gemini API response received successfully")

//     // Get first candidate
//     const candidate = data?.candidates?.[0]
//     if (!candidate?.content?.parts?.length) {
//       console.error("[v0] Unexpected Gemini API response structure:", JSON.stringify(data, null, 2))
//       throw new Error("Invalid response structure from Gemini API")
//     }

//     // Find the first part that has text
//     const textPart = candidate.content.parts.find((p) => p.text)
//     if (!textPart) {
//       console.error("[v0] No text part found in Gemini response:", candidate.content.parts)
//       throw new Error("Gemini response missing text content")
//     }

//     console.log("[v0] Successfully extracted text from Gemini response")
//     return textPart.text
//   } catch (error) {
//     console.error(`[v0] Error in callGeminiAPI (attempt ${retryCount + 1}):`, error.message)

//     // Retry on network errors or other transient issues
//     if (
//       retryCount < maxRetries &&
//       (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("timeout"))
//     ) {
//       const delay = Math.pow(2, retryCount) * 1000
//       console.log(`[v0] Retrying after ${delay}ms due to network error...`)
//       await new Promise((resolve) => setTimeout(resolve, delay))
//       return callGeminiAPI(prompt, retryCount + 1)
//     }

//     throw error
//   }
// }



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

    const prompt = buildComprehensivePrompt(user, recentSymptoms, recentCycles)

    let parsedResponse
    try {
      const aiResponse = await callGeminiAPI(prompt)
      parsedResponse = parseStructuredResponse(aiResponse)
    } catch (error) {
      console.log("[v0] AI API failed, using fallback insights:", error.message)
      parsedResponse = generateFallbackInsights(user, recentSymptoms, recentCycles)
    }

    // Save insights to database
    const insightRecord = {
      userId: authResult.userId,
      ...parsedResponse,
      rawResponse: parsedResponse.source || "fallback",
      createdAt: new Date(),
    }

    await db.collection("daily_insights").insertOne(insightRecord)

    return NextResponse.json({
      success: true,
      insights: parsedResponse.insights,
      cyclePredictions: parsedResponse.cyclePredictions,
      recommendations: parsedResponse.recommendations,
    })
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function buildComprehensivePrompt(user, recentSymptoms, recentCycles) {
  const today = new Date()
  const daysSinceLastPeriod = user.lastPeriodDate
    ? Math.floor((today - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24))
    : 15
  const cycleDay = (daysSinceLastPeriod % (user.cycleLength || 28)) + 1
  const currentPhase = determineCyclePhase(cycleDay, user.cycleLength || 28, user.periodLength || 4)

  return `
You are a menstrual health AI assistant providing personalized daily insights for ${user.name}.

User Profile:
- Name: ${user.name}
- Age: ${user.age || 25}
- Current cycle day: ${cycleDay}
- Current phase: ${currentPhase}
- Cycle length: ${user.cycleLength || 28} days
- Period length: ${user.periodLength || 4} days
- Height: ${user.height || 165}cm, Weight: ${user.weight || 60}kg
- Pain level: ${user.painLevel || 3}/5
- Energy level: ${user.energyLevel || 4}/5
- Sleep quality: ${user.sleepQuality || 3}/5

Recent Symptoms:
${
  recentSymptoms.length > 0
    ? recentSymptoms.map((s) => `- ${s.symptom} (${s.severity}/10) on ${new Date(s.date).toDateString()}`).join("\n")
    : "- No recent symptoms logged"
}

Recent Cycles:
${
  recentCycles.length > 0
    ? recentCycles.map((c) => `- Started ${new Date(c.startDate).toDateString()}, lasted ${c.length} days`).join("\n")
    : "- No recent cycle data available"
}

Please provide a comprehensive response in the following JSON format:

{
  "insights": "Hello ${user.name}! Here are some personalized insights for you today (cycle day ${cycleDay}, ${currentPhase} phase): **Physical Well-being:** [specific advice for current phase] **Emotional Well-being:** [specific advice for mood/emotional state during this phase]",
  "cyclePredictions": "[Specific predictions about fertile window, next period, or cycle patterns based on current phase and data]",
  "recommendations": [
    {
      "category": "Nutrition",
      "text": "[Specific nutrition advice for current cycle phase]"
    },
    {
      "category": "Exercise", 
      "text": "[Specific exercise recommendations for current phase]"
    },
    {
      "category": "Sleep",
      "text": "[Sleep advice based on current phase and user's sleep quality]"
    },
    {
      "category": "Self-Care",
      "text": "[Self-care recommendations for current phase and symptoms]"
    }
  ]
}

Make all advice specific to the ${currentPhase} phase and personalized based on the user's data. Be supportive, scientifically accurate, and helpful.
`
}

function determineCyclePhase(cycleDay, cycleLength, periodLength) {
  if (cycleDay <= periodLength) {
    return "menstrual"
  } else if (cycleDay <= cycleLength / 2) {
    return "follicular"
  } else if (cycleDay === Math.round(cycleLength / 2)) {
    return "ovulation"
  } else {
    return "luteal"
  }
}

function parseStructuredResponse(aiResponse) {
  try {
    console.log("[v0] Raw AI response length:", aiResponse.length)
    console.log("[v0] Raw AI response preview:", aiResponse.substring(0, 200))

    const cleanResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Try to find the start of JSON
    const jsonStart = cleanResponse.indexOf("{")
    if (jsonStart === -1) {
      throw new Error("No JSON object found in response")
    }

    // Extract from JSON start to end, handling potential truncation
    let jsonStr = cleanResponse.substring(jsonStart)

    // If the response seems truncated (doesn't end with }), try to complete it
    if (!jsonStr.trim().endsWith("}")) {
      console.log("[v0] Response appears truncated, attempting to complete JSON structure")

      // Count open braces to determine how many closes we need
      const openBraces = (jsonStr.match(/\{/g) || []).length
      const closeBraces = (jsonStr.match(/\}/g) || []).length
      const missingBraces = openBraces - closeBraces

      // If we're in the middle of a string, close it
      const openQuotes = (jsonStr.match(/"/g) || []).length
      if (openQuotes % 2 !== 0) {
        jsonStr += '"'
      }

      // If we're in an array, close it
      const openBrackets = (jsonStr.match(/\[/g) || []).length
      const closeBrackets = (jsonStr.match(/\]/g) || []).length
      const missingBrackets = openBrackets - closeBrackets

      // Add missing closing brackets and braces
      jsonStr += "]".repeat(missingBrackets)
      jsonStr += "}".repeat(missingBraces)
    }

    // Clean up common JSON formatting issues
    const cleanedJson = jsonStr
      .replace(/,\s*}/g, "}") // Remove trailing commas
      .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    console.log("[v0] Attempting to parse cleaned JSON:", cleanedJson.substring(0, 200))
    const parsed = JSON.parse(cleanedJson)

    return {
      insights: parsed.insights || "Personalized insights based on your cycle data.",
      cyclePredictions:
        parsed.cyclePredictions ||
        "Predictions improve with more cycle data. Log your periods regularly for better accuracy.",
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [
            {
              category: "Nutrition",
              text: "Focus on iron-rich foods and stay hydrated during your cycle.",
            },
            {
              category: "Exercise",
              text: "Light exercise like walking or yoga can help with cycle symptoms.",
            },
            {
              category: "Sleep",
              text: "Maintain consistent sleep schedule for better hormonal balance.",
            },
            {
              category: "Self-Care",
              text: "Practice stress management and listen to your body's needs.",
            },
          ],
    }
  } catch (error) {
    console.error("Error parsing AI response:", error)
    console.log("Raw AI response:", aiResponse.substring(0, 500))

    const extractedInsights = extractInsightsFromText(aiResponse)
    return extractedInsights
  }
}

function extractInsightsFromText(rawText) {
  // Try to extract meaningful content even if JSON parsing fails
  const lines = rawText.split("\n").filter((line) => line.trim())

  let insights = "Personalized insights based on your cycle data."
  const cyclePredictions = "Predictions improve with more cycle data. Log your periods regularly for better accuracy."

  // Look for insights in the raw text
  const insightMatch = rawText.match(/insights['"]\s*:\s*['"]([^'"]+)/i)
  if (insightMatch) {
    insights = insightMatch[1]
  } else if (rawText.includes("Physical Well-being") || rawText.includes("Emotional Well-being")) {
    // Extract the first meaningful paragraph
    const meaningfulText = rawText
      .substring(0, 400)
      .replace(/[{}"[\]]/g, "")
      .trim()
    if (meaningfulText.length > 50) {
      insights = meaningfulText + "..."
    }
  }

  return {
    insights,
    cyclePredictions,
    recommendations: [
      {
        category: "Nutrition",
        text: "Focus on iron-rich foods and stay hydrated during your cycle.",
      },
      {
        category: "Exercise",
        text: "Light exercise like walking or yoga can help with cycle symptoms.",
      },
      {
        category: "Sleep",
        text: "Maintain consistent sleep schedule for better hormonal balance.",
      },
      {
        category: "Self-Care",
        text: "Practice stress management and listen to your body's needs.",
      },
    ],
  }
}

function generateFallbackInsights(user, recentSymptoms, recentCycles) {
  const today = new Date()
  const daysSinceLastPeriod = user.lastPeriodDate
    ? Math.floor((today - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24))
    : 15
  const cycleDay = (daysSinceLastPeriod % (user.cycleLength || 28)) + 1
  const currentPhase = determineCyclePhase(cycleDay, user.cycleLength || 28, user.periodLength || 4)

  const phaseInsights = {
    menstrual: {
      insights: `Hello ${user.name}! You're currently in your menstrual phase (day ${cycleDay}). **Physical Well-being:** Your body is shedding the uterine lining, which may cause cramping and fatigue. Focus on gentle movement and adequate rest. **Emotional Well-being:** You may feel more optimistic and social as hormones support mood stability.`,
      predictions:
        "Your period should continue for a few more days. Energy levels typically start improving towards the end of menstruation.",
      nutrition:
        "Focus on iron-rich foods like spinach, lean meats, and legumes to replenish what's lost during menstruation.",
      exercise: "Gentle yoga, walking, or light stretching can help with cramps and improve circulation.",
    },
    follicular: {
      insights: `Hello ${user.name}! You're in your follicular phase (day ${cycleDay}). **Physical Well-being:** Your energy is building as estrogen levels rise. This is a great time for new activities and challenges. **Emotional Well-being:** You may feel more optimistic and social as hormones support mood stability.`,
      predictions: "You're approaching your fertile window. Ovulation is likely in the next 7-10 days.",
      nutrition: "Support rising estrogen with plenty of fresh vegetables, healthy fats, and complex carbohydrates.",
      exercise:
        "This is an excellent time for higher intensity workouts, strength training, or trying new fitness activities.",
    },
    ovulation: {
      insights: `Hello ${user.name}! You're likely ovulating (day ${cycleDay}). **Physical Well-being:** Peak fertility and energy levels. You may notice increased libido and clearer skin. **Emotional Well-being:** Confidence and communication skills are typically at their highest during ovulation.`,
      predictions: "This is your most fertile time. If trying to conceive, the next 24-48 hours are optimal.",
      nutrition: "Support ovulation with antioxidant-rich foods like berries, nuts, and leafy greens.",
      exercise: "Take advantage of peak energy with your favorite high-intensity workouts or sports.",
    },
    luteal: {
      insights: `Hello ${user.name}! You're in your luteal phase (day ${cycleDay}). **Physical Well-being:** Progesterone is rising, which may cause bloating, breast tenderness, or food cravings. **Emotional Well-being:** You may feel more introspective. PMS symptoms can occur in the later part of this phase.`,
      predictions:
        "Your next period is expected in about " + Math.max(1, (user.cycleLength || 28) - cycleDay + 1) + " days.",
      nutrition:
        "Combat cravings with balanced meals including protein, healthy fats, and complex carbs. Limit caffeine and sugar.",
      exercise: "Focus on moderate activities like walking, swimming, or restorative yoga as energy may fluctuate.",
    },
  }

  const phaseData = phaseInsights[currentPhase] || phaseInsights.follicular

  return {
    insights: phaseData.insights,
    cyclePredictions: phaseData.predictions,
    recommendations: [
      {
        category: "Nutrition",
        text: phaseData.nutrition,
      },
      {
        category: "Exercise",
        text: phaseData.exercise,
      },
      {
        category: "Sleep",
        text:
          currentPhase === "menstrual" || currentPhase === "luteal"
            ? "Prioritize 7-9 hours of sleep as your body needs extra rest during this phase."
            : "Maintain consistent sleep schedule to support hormonal balance and energy levels.",
      },
      {
        category: "Self-Care",
        text:
          currentPhase === "menstrual"
            ? "Use heat therapy for cramps, take warm baths, and be gentle with yourself."
            : currentPhase === "luteal"
              ? "Practice stress management techniques and prepare for potential PMS symptoms."
              : "This is a great time for social activities and pursuing goals with your higher energy levels.",
      },
    ],
    source: "fallback",
  }
}

async function callGeminiAPI(prompt, retryCount = 0) {
  const maxRetries = 3

  try {
    console.log(`[v0] Calling Gemini API (attempt ${retryCount + 1}/${maxRetries + 1})`)

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Gemini API error (${response.status}):`, errorText)

      if (response.status === 429) {
        const error = new Error("API quota exceeded. Please try again later or upgrade your plan.")
        error.isQuotaError = true
        throw error
      }

      // If it's a server error (5xx), retry
      if (response.status >= 500 && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`[v0] Retrying after ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return callGeminiAPI(prompt, retryCount + 1)
      }

      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Gemini API response received successfully")

    // Get first candidate
    const candidate = data?.candidates?.[0]
    if (!candidate?.content?.parts?.length) {
      console.error("[v0] Unexpected Gemini API response structure:", JSON.stringify(data, null, 2))
      throw new Error("Invalid response structure from Gemini API")
    }

    // Find the first part that has text
    const textPart = candidate.content.parts.find((p) => p.text)
    if (!textPart) {
      console.error("[v0] No text part found in Gemini response:", candidate.content.parts)
      throw new Error("Gemini response missing text content")
    }

    console.log("[v0] Successfully extracted text from Gemini response")
    return textPart.text
  } catch (error) {
    console.error(`[v0] Error in callGeminiAPI (attempt ${retryCount + 1}):`, error.message)

    if (error.isQuotaError) {
      throw error
    }

    // Retry on network errors or other transient issues
    if (
      retryCount < maxRetries &&
      (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("timeout"))
    ) {
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`[v0] Retrying after ${delay}ms due to network error...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return callGeminiAPI(prompt, retryCount + 1)
    }

    throw error
  }
}
