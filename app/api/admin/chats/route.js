import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 100

    console.log(`🔍 Fetching all AI chats (admin) with limit: ${limit}`)

    const { db } = await connectToDatabase()
    
    // Fetch all AI chats from all users
    const chats = await db.collection("ai_chats")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    console.log(`✅ Found ${chats.length} AI chats in database`)

    // Normalize chat data
    const normalizedChats = chats.map(chat => ({
      id: chat._id?.toString() || chat.id || Math.random().toString(36).substr(2, 9),
      userId: chat.userId,
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: normalizedChats,
      total: normalizedChats.length
    })

  } catch (error) {
    console.error("❌ Error fetching AI chats (admin):", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI chats" },
      { status: 500 }
    )
  }
}
