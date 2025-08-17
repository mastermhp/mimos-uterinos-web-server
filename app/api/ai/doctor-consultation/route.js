import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, symptoms, severity, duration, additionalNotes } = body

    if (!userId || !symptoms) {
      return NextResponse.json({ success: false, error: "User ID and symptoms are required" }, { status: 400 })
    }

    console.log(`🩺 Processing AI doctor consultation for userId: ${userId}`)

    const { db } = await connectToDatabase()

    // Get user context
    let userContext = ""
    try {
      const user = await db.collection("users").findOne({
        $or: [
          { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null },
          { _id: userId },
          { id: userId },
          { _id: Number.parseInt(userId) },
        ],
      })

      if (user) {
        userContext = `Patient Profile: Age ${user.age || "unknown"}, cycle length ${user.cycleLength || 28} days, period length ${user.periodLength || 5} days.`
      }
    } catch (error) {
      console.log("Could not fetch user context:", error.message)
    }

    // Generate AI prescription
    const aiResponse = await generateMedicalConsultation(symptoms, severity, duration, additionalNotes, userContext)

    // Save consultation to database
    const consultation = {
      userId: userId.toString(),
      symptoms,
      severity: Number.parseInt(severity),
      duration,
      additionalNotes,
      aiResponse,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("consultations").insertOne(consultation)

    const savedConsultation = {
      id: result.insertedId.toString(),
      ...consultation,
    }

    console.log("✅ AI doctor consultation completed:", savedConsultation.id)

    return NextResponse.json({
      success: true,
      data: savedConsultation,
    })
  } catch (error) {
    console.error("❌ Error processing AI doctor consultation:", error)
    return NextResponse.json({ success: false, error: "Failed to process consultation" }, { status: 500 })
  }
}

async function generateMedicalConsultation(symptoms, severity, duration, additionalNotes, userContext) {
  try {
    const prompt = `You are Dr. Mimos AI, a specialized menstrual health physician. Generate a professional medical consultation report in prescription format.

${userContext}

PATIENT SYMPTOMS:
- Primary Symptoms: ${symptoms}
- Severity Level: ${severity}/10
- Duration: ${duration}
- Additional Notes: ${additionalNotes || "None"}

Please provide a comprehensive medical consultation in the following format:

MEDICAL ASSESSMENT:
[Provide professional analysis of the symptoms]

DIAGNOSIS/IMPRESSION:
[Your medical impression based on symptoms]

RECOMMENDATIONS:
[Detailed treatment recommendations including:]
• Lifestyle modifications
• Dietary suggestions
• Pain management strategies
• When to seek immediate medical attention

PRESCRIPTION (if applicable):
[Any over-the-counter medications or remedies that might help]

FOLLOW-UP:
[When to return for follow-up or seek additional care]

IMPORTANT NOTES:
[Any warnings or important considerations]

Keep the response professional, medically accurate, and focused on menstrual health. Include disclaimers about seeking professional medical care for serious conditions.`

    console.log("🩺 Calling Gemini API for medical consultation...")

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
          temperature: 0.3, // Lower temperature for more consistent medical advice
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error response:", errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("🩺 Gemini API medical consultation response received")

    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error("No candidates in Gemini API response:", JSON.stringify(data, null, 2))
      throw new Error("No candidates returned from Gemini API")
    }

    const candidate = data.candidates[0]
    if (
      !candidate.content ||
      !candidate.content.parts ||
      !candidate.content.parts[0] ||
      !candidate.content.parts[0].text
    ) {
      console.error("Invalid response structure:", JSON.stringify(candidate, null, 2))
      throw new Error("Invalid Gemini API response structure")
    }

    return candidate.content.parts[0].text
  } catch (error) {
    console.error("Error generating medical consultation:", error)
    throw error
  }
}
