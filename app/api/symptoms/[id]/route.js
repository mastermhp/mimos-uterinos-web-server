import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const symptomId = resolvedParams.id

    if (!symptomId) {
      return NextResponse.json(
        { success: false, error: "Symptom ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      date,
      symptoms,
      flow,
      mood,
      temperature,
      notes
    } = body

    console.log(`📝 Updating symptom log with ID: ${symptomId}`)

    const { db } = await connectToDatabase()

    const updateData = {
      updatedAt: new Date().toISOString()
    }

    if (date) updateData.date = date
    if (symptoms !== undefined) updateData.symptoms = symptoms
    if (flow) updateData.flow = flow
    if (mood) updateData.mood = mood
    if (temperature !== undefined) updateData.temperature = temperature
    if (notes !== undefined) updateData.notes = notes

    const result = await db.collection("symptoms").updateOne(
      { _id: new ObjectId(symptomId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Symptom log not found" },
        { status: 404 }
      )
    }

    // Get updated symptom log
    const updatedSymptom = await db.collection("symptoms").findOne({ _id: new ObjectId(symptomId) })

    const normalizedSymptom = {
      id: updatedSymptom._id.toString(),
      userId: updatedSymptom.userId.toString(),
      date: updatedSymptom.date,
      symptoms: updatedSymptom.symptoms || [],
      flow: updatedSymptom.flow,
      mood: updatedSymptom.mood,
      temperature: updatedSymptom.temperature,
      notes: updatedSymptom.notes || "",
      createdAt: updatedSymptom.createdAt,
      updatedAt: updatedSymptom.updatedAt
    }

    console.log("✅ Symptom log updated successfully:", symptomId)

    return NextResponse.json({
      success: true,
      message: "Symptom log updated successfully",
      data: normalizedSymptom
    })

  } catch (error) {
    console.error("❌ Error updating symptom log:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update symptom log" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const symptomId = resolvedParams.id

    if (!symptomId) {
      return NextResponse.json(
        { success: false, error: "Symptom ID is required" },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting symptom log with ID: ${symptomId}`)

    const { db } = await connectToDatabase()

    const result = await db.collection("symptoms").deleteOne({
      _id: new ObjectId(symptomId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Symptom log not found" },
        { status: 404 }
      )
    }

    console.log("✅ Symptom log deleted successfully:", symptomId)

    return NextResponse.json({
      success: true,
      message: "Symptom log deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting symptom log:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete symptom log" },
      { status: 500 }
    )
  }
}
