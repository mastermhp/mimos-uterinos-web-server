import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const chatId = resolvedParams.id

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Chat ID is required" },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting AI chat with ID: ${chatId}`)

    const { db } = await connectToDatabase()

    const result = await db.collection("ai_chats").deleteOne({
      _id: new ObjectId(chatId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      )
    }

    console.log("✅ AI chat deleted successfully:", chatId)

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting AI chat:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete chat" },
      { status: 500 }
    )
  }
}
