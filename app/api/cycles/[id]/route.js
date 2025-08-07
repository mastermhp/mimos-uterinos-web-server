import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const cycleId = resolvedParams.id

    if (!cycleId) {
      return NextResponse.json(
        { success: false, error: "Cycle ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      startDate,
      endDate,
      cycleLength,
      periodLength,
      flow,
      mood,
      symptoms,
      temperature,
      notes
    } = body

    console.log(`📝 Updating cycle with ID: ${cycleId}`)

    const { db } = await connectToDatabase()

    const updateData = {
      updatedAt: new Date().toISOString()
    }

    if (startDate) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate
    if (cycleLength) updateData.cycleLength = cycleLength
    if (periodLength) updateData.periodLength = periodLength
    if (flow) updateData.flow = flow
    if (mood) updateData.mood = mood
    if (symptoms !== undefined) updateData.symptoms = symptoms
    if (temperature !== undefined) updateData.temperature = temperature
    if (notes !== undefined) updateData.notes = notes

    const result = await db.collection("cycles").updateOne(
      { _id: new ObjectId(cycleId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Cycle not found" },
        { status: 404 }
      )
    }

    // Get updated cycle
    const updatedCycle = await db.collection("cycles").findOne({ _id: new ObjectId(cycleId) })

    const normalizedCycle = {
      id: updatedCycle._id.toString(),
      userId: updatedCycle.userId.toString(),
      startDate: updatedCycle.startDate,
      endDate: updatedCycle.endDate,
      cycleLength: updatedCycle.cycleLength,
      periodLength: updatedCycle.periodLength,
      flow: updatedCycle.flow,
      mood: updatedCycle.mood,
      symptoms: updatedCycle.symptoms || [],
      temperature: updatedCycle.temperature,
      notes: updatedCycle.notes || "",
      createdAt: updatedCycle.createdAt,
      updatedAt: updatedCycle.updatedAt
    }

    console.log("✅ Cycle updated successfully:", cycleId)

    return NextResponse.json({
      success: true,
      message: "Cycle updated successfully",
      data: normalizedCycle
    })

  } catch (error) {
    console.error("❌ Error updating cycle:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update cycle" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const cycleId = resolvedParams.id

    if (!cycleId) {
      return NextResponse.json(
        { success: false, error: "Cycle ID is required" },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting cycle with ID: ${cycleId}`)

    const { db } = await connectToDatabase()

    const result = await db.collection("cycles").deleteOne({
      _id: new ObjectId(cycleId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Cycle not found" },
        { status: 404 }
      )
    }

    console.log("✅ Cycle deleted successfully:", cycleId)

    return NextResponse.json({
      success: true,
      message: "Cycle deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting cycle:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete cycle" },
      { status: 500 }
    )
  }
}
