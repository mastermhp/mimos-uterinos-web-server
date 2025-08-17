"use client"

import { useState, useEffect } from "react"

export default function DoctorModeScreen({ user, onBack }) {
  const [consultations, setConsultations] = useState([])
  const [newConsultation, setNewConsultation] = useState({
    symptoms: "",
    severity: 5,
    duration: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`/api/consultations?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success) {
        setConsultations(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching consultations:", error)
    }
  }

  const submitConsultation = async () => {
    if (!newConsultation.symptoms.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          ...newConsultation,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConsultations((prev) => [data.data, ...prev])
        setNewConsultation({ symptoms: "", severity: 5, duration: "", notes: "" })
        alert("Consultation request submitted successfully!")
      } else {
        alert("Failed to submit consultation request")
      }
    } catch (error) {
      console.error("Error submitting consultation:", error)
      alert("Error submitting consultation request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Doctor Mode</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* New Consultation Form */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Consultation</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <textarea
                value={newConsultation.symptoms}
                onChange={(e) => setNewConsultation((prev) => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Describe your symptoms..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newConsultation.severity}
                onChange={(e) => setNewConsultation((prev) => ({ ...prev, severity: Number.parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">{newConsultation.severity}/10</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={newConsultation.duration}
                onChange={(e) => setNewConsultation((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 3 days, 1 week"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={newConsultation.notes}
                onChange={(e) => setNewConsultation((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <button
              onClick={submitConsultation}
              disabled={isSubmitting || !newConsultation.symptoms.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
            </button>
          </div>
        </div>

        {/* Previous Consultations */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Previous Consultations</h2>

          {consultations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No consultations yet</p>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consultation.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : consultation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {consultation.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{consultation.symptoms}</p>
                  <div className="text-xs text-gray-500">
                    Severity: {consultation.severity}/10 • Duration: {consultation.duration}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
