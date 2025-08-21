import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const consultationId = resolvedParams.id

    if (!consultationId) {
      return NextResponse.json(
        { success: false, error: "Consultation ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      doctorName,
      type,
      status,
      scheduledDate,
      duration,
      reason,
      notes
    } = body

    console.log(`📝 Updating consultation with ID: ${consultationId}`)

    const { db } = await connectToDatabase()

    const updateData = {
      updatedAt: new Date().toISOString()
    }

    if (doctorName) updateData.doctorName = doctorName
    if (type) updateData.type = type
    if (status) updateData.status = status
    if (scheduledDate) updateData.scheduledDate = scheduledDate
    if (duration) updateData.duration = duration
    if (reason !== undefined) updateData.reason = reason
    if (notes !== undefined) updateData.notes = notes

    const result = await db.collection("consultations").updateOne(
      { _id: new ObjectId(consultationId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Consultation not found" },
        { status: 404 }
      )
    }

    // Get updated consultation
    const updatedConsultation = await db.collection("consultations").findOne({ _id: new ObjectId(consultationId) })

    const normalizedConsultation = {
      id: updatedConsultation._id.toString(),
      userId: updatedConsultation.userId.toString(),
      doctorName: updatedConsultation.doctorName,
      type: updatedConsultation.type,
      status: updatedConsultation.status,
      scheduledDate: updatedConsultation.scheduledDate,
      duration: updatedConsultation.duration,
      reason: updatedConsultation.reason,
      notes: updatedConsultation.notes || "",
      createdAt: updatedConsultation.createdAt,
      updatedAt: updatedConsultation.updatedAt
    }

    console.log("✅ Consultation updated successfully:", consultationId)

    return NextResponse.json({
      success: true,
      message: "Consultation updated successfully",
      data: normalizedConsultation
    })

  } catch (error) {
    console.error("❌ Error updating consultation:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update consultation" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const consultationId = resolvedParams.id

    if (!consultationId) {
      return NextResponse.json(
        { success: false, error: "Consultation ID is required" },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting consultation with ID: ${consultationId}`)

    const { db } = await connectToDatabase()

    const result = await db.collection("consultations").deleteOne({
      _id: new ObjectId(consultationId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Consultation not found" },
        { status: 404 }
      )
    }

    console.log("✅ Consultation deleted successfully:", consultationId)

    return NextResponse.json({
      success: true,
      message: "Consultation deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting consultation:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete consultation" },
      { status: 500 }
    )
  }
}
