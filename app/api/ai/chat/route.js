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

    const { message, conversationId } = await request.json()

    const db = await connectDB()

    // Get user data for context
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(authResult.userId) }, { projection: { password: 0, salt: 0 } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get conversation history if exists
    let conversation = null
    if (conversationId) {
      conversation = await db.collection("conversations").findOne({
        _id: new ObjectId(conversationId),
        userId: authResult.userId,
      })
    }

    // Build context from user data and conversation history
    const context = buildChatContext(user, conversation)
    const prompt = `${context}\n\nUser: ${message}\nAI:`

    // Call Gemini API
    const aiResponse = await callGeminiAPI(prompt)

    // Save or update conversation
    const messageData = {
      userMessage: message,
      aiResponse,
      timestamp: new Date(),
    }

    if (conversation) {
      await db.collection("conversations").updateOne(
        { _id: conversation._id },
        {
          $push: { messages: messageData },
          $set: { updatedAt: new Date() },
        },
      )
    } else {
      const newConversation = {
        userId: authResult.userId,
        messages: [messageData],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("conversations").insertOne(newConversation)
      const conversationId = result.insertedId
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId,
    })
  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function buildChatContext(user, conversation) {
  const today = new Date()
  const daysSinceLastPeriod = Math.floor((today - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24))
  const cycleDay = (daysSinceLastPeriod % user.cycleLength) + 1
  const currentPhase = determineCyclePhase(cycleDay, user.cycleLength, user.periodLength)

  let context = `
You are a menstrual health AI coach providing personalized advice to users.

User Context:
- Name: ${user.name}
- Age: ${user.age}
- Current cycle day: ${cycleDay}
- Current phase: ${currentPhase}
- Cycle length: ${user.cycleLength} days
- Period length: ${user.periodLength} days
`

  if (conversation && conversation.messages.length > 0) {
    context += "\n\nConversation History:\n"
    conversation.messages.slice(-5).forEach((msg) => {
      context += `User: ${msg.userMessage}\nAI: ${msg.aiResponse}\n\n`
    })
  }

  context += `
Please provide helpful, evidence-based responses that are personalized to the user's current cycle phase and health data.
Keep responses concise (3-5 sentences), supportive, and scientifically accurate.
If you don't have enough information to answer accurately, acknowledge this and suggest what additional information would be helpful.
`

  return context
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
        temperature: 0.7,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get AI response")
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}
