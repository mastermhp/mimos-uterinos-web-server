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
    const { userId, message, chatId } = body

    if (!userId || !message) {
      return NextResponse.json({ success: false, error: "User ID and message are required" }, { status: 400 })
    }

    console.log(`📝 Processing AI chat for userId: ${userId}`)

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

    let chatResult
    if (chatId) {
      // Update existing chat
      const newMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      }
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      }

      await db.collection("ai_chats").updateOne(
        { _id: new ObjectId(chatId) },
        {
          $push: {
            messages: { $each: [newMessage, aiMessage] },
          },
          $set: { updatedAt: new Date().toISOString() },
        },
      )

      const updatedChat = await db.collection("ai_chats").findOne({ _id: new ObjectId(chatId) })
      chatResult = {
        id: updatedChat._id.toString(),
        userId: updatedChat.userId,
        messages: updatedChat.messages,
        createdAt: updatedChat.createdAt,
        updatedAt: updatedChat.updatedAt,
      }
    } else {
      // Create new chat
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
      chatResult = {
        id: result.insertedId.toString(),
        ...newChat,
      }
    }

    console.log("✅ AI chat processed successfully:", chatResult.id)

    return NextResponse.json({
      success: true,
      data: chatResult,
    })
  } catch (error) {
    console.error("❌ Error processing AI chat:", error)
    return NextResponse.json({ success: false, error: "Failed to process AI chat" }, { status: 500 })
  }
}

async function callGeminiAPI(userMessage, userId, db) {
  try {
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

    console.log("🤖 Calling Gemini API...")

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
    console.log("🤖 Gemini API response received")
    console.log("🤖 Full response data:", JSON.stringify(data, null, 2))

    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error("No candidates in Gemini API response:", JSON.stringify(data, null, 2))
      throw new Error("No candidates returned from Gemini API")
    }

    const candidate = data.candidates[0]
    if (!candidate.content) {
      console.error("No content in candidate:", JSON.stringify(candidate, null, 2))
      throw new Error("No content in Gemini API candidate")
    }

    if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      console.error("No parts in content:", JSON.stringify(candidate.content, null, 2))
      throw new Error("No parts in Gemini API content")
    }

    const text = candidate.content.parts[0].text
    if (!text) {
      console.error("No text in first part:", JSON.stringify(candidate.content.parts[0], null, 2))
      throw new Error("No text in Gemini API response")
    }

    return text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
