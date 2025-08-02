import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mock chat data
const mockChats = [
  {
    id: 1,
    userId: 1,
    messages: [
      {
        id: 1,
        role: "user",
        content: "I'm experiencing severe cramps today. What can I do?",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        role: "assistant",
        content:
          "I understand you're experiencing severe cramps. Here are some suggestions that might help: 1) Apply heat to your lower abdomen or back, 2) Try gentle exercises like walking or yoga, 3) Consider over-the-counter pain relievers like ibuprofen, 4) Stay hydrated and get adequate rest. If the pain is unusually severe or persistent, please consult with a healthcare provider.",
        timestamp: "2024-01-15T10:00:30Z",
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:30Z",
  },
  {
    id: 2,
    userId: 2,
    messages: [
      {
        id: 1,
        role: "user",
        content: "How can I track my mood changes during my cycle?",
        timestamp: "2024-01-14T15:30:00Z",
      },
      {
        id: 2,
        role: "assistant",
        content:
          "Tracking mood changes is a great way to understand your cycle patterns! Here's how you can do it: 1) Use the mood tracker in the app daily, 2) Note specific emotions (happy, sad, irritable, anxious), 3) Rate intensity on a scale of 1-5, 4) Look for patterns over 2-3 cycles. Common mood changes occur during PMS (days 21-28) and ovulation (around day 14). This data helps predict and prepare for emotional changes.",
        timestamp: "2024-01-14T15:30:45Z",
      },
    ],
    createdAt: "2024-01-14T15:30:00Z",
    updatedAt: "2024-01-14T15:30:45Z",
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const { db } = await connectToDatabase()
    const query = {}
    if (userId) query.userId = new ObjectId(userId)
    const chats = await db.collection("ai_chats").find(query).toArray()

    let filteredChats = chats
    if (userId) {
      filteredChats = chats.filter((chat) => chat.userId.toString() === userId)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedChats = filteredChats.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedChats,
      pagination: {
        page,
        limit,
        total: filteredChats.length,
        totalPages: Math.ceil(filteredChats.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId, message } = await request.json()

    const { db } = await connectToDatabase()
    // Find existing chat or create new one
    let chat = await db.collection("ai_chats").findOne({ userId: new ObjectId(userId) })
    if (!chat) {
      chat = {
        _id: new ObjectId(),
        userId: new ObjectId(userId),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.collection("ai_chats").insertOne(chat)
    }

    // Add user message
    const userMessage = {
      id: chat.messages.length + 1,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }
    chat.messages.push(userMessage)

    // Generate AI response (mock)
    const aiResponse = generateAIResponse(message)
    const assistantMessage = {
      id: chat.messages.length + 1,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    }
    chat.messages.push(assistantMessage)

    chat.updatedAt = new Date().toISOString()
    await db.collection("ai_chats").updateOne({ _id: chat._id }, { $set: chat })

    return NextResponse.json({
      success: true,
      data: {
        chatId: chat._id.toString(),
        message: assistantMessage,
      },
    })
  } catch (error) {
    console.error("Error processing chat:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

function generateAIResponse(userMessage) {
  // Simple mock AI responses based on keywords
  const message = userMessage.toLowerCase()

  if (message.includes("cramp") || message.includes("pain")) {
    return "I understand you're experiencing pain. Here are some suggestions: apply heat, try gentle exercise, consider over-the-counter pain relievers, and stay hydrated. If pain is severe, consult a healthcare provider."
  }

  if (message.includes("mood") || message.includes("emotional")) {
    return "Mood changes during your cycle are normal due to hormonal fluctuations. Try stress-reduction techniques, regular exercise, adequate sleep, and consider talking to someone you trust."
  }

  if (message.includes("period") || message.includes("cycle")) {
    return "I can help you track and understand your menstrual cycle. Regular tracking helps identify patterns and predict your next period. What specific aspect would you like to know more about?"
  }

  if (message.includes("symptom")) {
    return "Tracking symptoms helps identify patterns and prepare for your cycle. Common symptoms include cramps, bloating, mood changes, and fatigue. Would you like tips for managing specific symptoms?"
  }

  if (message.includes("ovulation")) {
    return "Ovulation typically occurs around day 14 of a 28-day cycle. Signs include changes in cervical mucus, slight temperature increase, and sometimes mild pain. Tracking these signs can help predict ovulation."
  }

  return "Thank you for your question. I'm here to help with menstrual health topics. Could you provide more specific details about what you'd like to know?"
}
