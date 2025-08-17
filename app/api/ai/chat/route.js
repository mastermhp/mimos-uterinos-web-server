import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    console.log(`🔍 Fetching AI chats for userId: ${userId}`)

    const { db } = await connectToDatabase()
    let chats = []

    // Try multiple query strategies
    const queryStrategies = [
      // Strategy 1: ObjectId format in userId field
      async () => {
        if (ObjectId.isValid(userId)) {
          console.log(`🔍 Query 1: { userId: new ObjectId('${userId}') }`)
          return await db
            .collection("ai_chats")
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray()
        }
        return []
      },
      // Strategy 2: String userId
      async () => {
        console.log(`🔍 Query 2: { userId: '${userId}' }`)
        return await db.collection("ai_chats").find({ userId: userId }).sort({ createdAt: -1 }).toArray()
      },
      // Strategy 3: Numeric userId
      async () => {
        const numericUserId = Number.parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("ai_chats").find({ userId: numericUserId }).sort({ createdAt: -1 }).toArray()
        }
        return []
      },
    ]

    for (let i = 0; i < queryStrategies.length; i++) {
      try {
        chats = await queryStrategies[i]()
        console.log(`✅ Found AI chats from database (strategy ${i + 1}): ${chats.length}`)
        if (chats.length > 0) {
          break
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed:`, error.message)
        continue
      }
    }

    // Normalize chat data
    const normalizedChats = chats.map((chat) => ({
      id: chat._id?.toString() || chat.id || Math.random().toString(36).substr(2, 9),
      userId: chat.userId,
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }))

    console.log(`📊 Returning ${normalizedChats.length} AI chats`)

    return NextResponse.json({
      success: true,
      data: normalizedChats,
    })
  } catch (error) {
    console.error("❌ Error fetching AI chats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch AI chats" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, message } = body

    if (!userId || !message) {
      return NextResponse.json({ success: false, error: "User ID and message are required" }, { status: 400 })
    }

    console.log(`📝 Creating AI chat for userId: ${userId}`)

    const { db } = await connectToDatabase()

    let aiResponse = "I'm here to help with your menstrual health questions. Could you please provide more details?"

    try {
      // Call Gemini API for real AI response
      aiResponse = await callGeminiAPI(message, userId, db)
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error)
      aiResponse =
        "I'm having trouble processing your request right now. Please try asking about your cycle, symptoms, or any menstrual health concerns."
    }

    const newChat = {
      userId: userId.toString(),
      messages: [
        {
          id: 1,
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("ai_chats").insertOne(newChat)

    const createdChat = {
      id: result.insertedId.toString(),
      ...newChat,
    }

    console.log("✅ AI chat created successfully:", createdChat.id)

    return NextResponse.json({
      success: true,
      data: createdChat,
    })
  } catch (error) {
    console.error("❌ Error creating AI chat:", error)
    return NextResponse.json({ success: false, error: "Failed to create AI chat" }, { status: 500 })
  }
}

async function callGeminiAPI(userMessage, userId, db) {
  try {
    // Get user context for personalized responses
    let userContext = ""
    try {
      const user = await db.collection("users").findOne({
        $or: [{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null }, { _id: userId }, { id: userId }],
      })

      if (user) {
        userContext = `User context: Age ${user.age || "unknown"}, cycle length ${user.cycleLength || 28} days, period length ${user.periodLength || 5} days.`
      }
    } catch (error) {
      console.log("Could not fetch user context:", error.message)
    }

    const prompt = `You are Mimos Uterinos AI, a specialized menstrual health assistant. ${userContext}

User question: "${userMessage}"

Please provide a helpful, accurate, and supportive response focused on menstrual health, cycle tracking, symptoms, and women's wellness. Keep responses concise but informative. If the question is not related to menstrual health, politely redirect to menstrual health topics.

Guidelines:
- Be supportive and understanding
- Provide evidence-based information
- Suggest when to consult healthcare providers for serious concerns
- Focus on menstrual health, cycle tracking, symptoms, fertility, and related wellness topics
- Keep responses under 200 words`

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
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid Gemini API response format")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
