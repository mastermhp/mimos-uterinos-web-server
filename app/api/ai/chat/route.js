import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
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
          return await db.collection("ai_chats").find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray()
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
        const numericUserId = parseInt(userId)
        if (!isNaN(numericUserId)) {
          console.log(`🔍 Query 3: { userId: ${numericUserId} }`)
          return await db.collection("ai_chats").find({ userId: numericUserId }).sort({ createdAt: -1 }).toArray()
        }
        return []
      }
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
    const normalizedChats = chats.map(chat => ({
      id: chat._id?.toString() || chat.id || Math.random().toString(36).substr(2, 9),
      userId: chat.userId,
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }))

    console.log(`📊 Returning ${normalizedChats.length} AI chats`)

    return NextResponse.json({
      success: true,
      data: normalizedChats
    })

  } catch (error) {
    console.error("❌ Error fetching AI chats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI chats" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, message } = body

    if (!userId || !message) {
      return NextResponse.json(
        { success: false, error: "User ID and message are required" },
        { status: 400 }
      )
    }

    console.log(`📝 Creating AI chat for userId: ${userId}`)

    const { db } = await connectToDatabase()

    // Simple AI response (replace with actual AI integration)
    const aiResponse = "Thank you for your question. I'm here to help with menstrual health topics."

    const newChat = {
      userId: userId.toString(),
      messages: [
        {
          id: 1,
          role: "user",
          content: message,
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection("ai_chats").insertOne(newChat)
    
    const createdChat = {
      id: result.insertedId.toString(),
      ...newChat
    }

    console.log("✅ AI chat created successfully:", createdChat.id)

    return NextResponse.json({
      success: true,
      data: createdChat
    })

  } catch (error) {
    console.error("❌ Error creating AI chat:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create AI chat" },
      { status: 500 }
    )
  }
}
