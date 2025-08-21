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

      if (response.status === 429) {
        console.log("🩺 Quota exceeded, providing fallback medical consultation...")
        return generateFallbackConsultation(symptoms, severity, duration, additionalNotes, userContext)
      }

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

    if (error.message.includes("429") || error.message.includes("quota")) {
      console.log("🩺 Providing fallback consultation due to quota limits...")
      return generateFallbackConsultation(symptoms, severity, duration, additionalNotes, userContext)
    }

    throw error
  }
}

function generateFallbackConsultation(symptoms, severity, duration, additionalNotes, userContext) {
  const severityLevel = Number.parseInt(severity) || 5

  const assessment = "Based on the symptoms provided, this appears to be related to menstrual health concerns."
  const recommendations = []
  const prescription = []
  let followUp = "Monitor symptoms and consult with a healthcare provider if they persist or worsen."

  // Basic symptom-based recommendations
  if (symptoms.toLowerCase().includes("cramp") || symptoms.toLowerCase().includes("pain")) {
    recommendations.push("Apply heat therapy (heating pad or warm bath)")
    recommendations.push("Gentle exercise like walking or yoga")
    recommendations.push("Stay hydrated and maintain regular sleep schedule")
    prescription.push("Over-the-counter pain relievers like ibuprofen or naproxen as directed")
  }

  if (symptoms.toLowerCase().includes("heavy") || symptoms.toLowerCase().includes("bleeding")) {
    recommendations.push("Track your menstrual flow and cycle")
    recommendations.push("Ensure adequate iron intake through diet")
    recommendations.push("Rest and avoid strenuous activities")
    followUp = "Consult a healthcare provider if heavy bleeding continues for more than 7 days"
  }

  if (symptoms.toLowerCase().includes("irregular") || symptoms.toLowerCase().includes("missed")) {
    recommendations.push("Maintain a menstrual cycle calendar")
    recommendations.push("Manage stress through relaxation techniques")
    recommendations.push("Maintain a healthy diet and regular exercise routine")
  }

  if (severityLevel >= 7) {
    followUp = "Given the high severity level, please consult with a healthcare provider promptly"
    recommendations.push("Seek medical attention if pain is severe or interfering with daily activities")
  }

  return `MEDICAL ASSESSMENT:
${assessment} ${userContext ? `Considering your profile: ${userContext}` : ""}

The reported severity level of ${severityLevel}/10 ${severityLevel >= 7 ? "indicates significant discomfort that warrants medical attention." : "suggests manageable symptoms with appropriate care."}

DIAGNOSIS/IMPRESSION:
Menstrual-related symptoms requiring supportive care and monitoring. ${duration ? `Duration of ${duration} is noted.` : ""} ${additionalNotes ? `Additional context: ${additionalNotes}` : ""}

RECOMMENDATIONS:
${recommendations.length > 0 ? recommendations.map((rec) => `• ${rec}`).join("\n") : "• General menstrual health support measures"}
• Maintain good hygiene practices
• Keep a symptom diary to track patterns
• Ensure adequate nutrition with focus on iron and calcium

PRESCRIPTION (if applicable):
${prescription.length > 0 ? prescription.map((med) => `• ${med}`).join("\n") : "• Consult with a pharmacist for appropriate over-the-counter options"}
• Always follow package directions and consult healthcare providers for persistent symptoms

FOLLOW-UP:
${followUp}
• Return if symptoms worsen or new symptoms develop
• Consider scheduling a routine gynecological check-up

IMPORTANT NOTES:
⚠️ This is an automated consultation due to temporary service limitations. For personalized medical advice, please consult with a qualified healthcare provider.
⚠️ Seek immediate medical attention for severe pain, excessive bleeding, or signs of infection.
⚠️ This consultation is not a substitute for professional medical diagnosis and treatment.

**Note: AI consultation services are temporarily limited due to usage quotas. This fallback consultation provides general guidance based on common menstrual health practices.**`
}
