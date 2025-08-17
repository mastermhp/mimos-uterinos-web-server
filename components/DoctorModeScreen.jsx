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
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    doctorName: "",
    type: "virtual",
    scheduledDate: "",
    reason: "",
    notes: "",
  })

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
        alert("AI consultation request submitted successfully!")
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

  const bookRealDoctorConsultation = async () => {
    if (!bookingData.doctorName.trim() || !bookingData.scheduledDate) {
      alert("Please fill in doctor name and scheduled date")
      return
    }

    try {
      const response = await fetch("/api/doctor/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          ...bookingData,
          duration: 30,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowBookingModal(false)
        setBookingData({
          doctorName: "",
          type: "virtual",
          scheduledDate: "",
          reason: "",
          notes: "",
        })
        alert("Doctor consultation booked successfully!")
      } else {
        alert("Failed to book consultation")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
      alert("Error booking consultation")
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
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Consultation Type</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-xl font-medium flex flex-col items-center space-y-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>AI Doctor</span>
              <span className="text-xs opacity-80">Instant Response</span>
            </button>

            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-medium flex flex-col items-center space-y-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Real Doctor</span>
              <span className="text-xs opacity-80">Book Appointment</span>
            </button>
          </div>
        </div>

        {/* AI Consultation Form */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Consultation Request</h2>

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
              {isSubmitting ? "Submitting..." : "Submit AI Consultation Request"}
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

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 m-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Book Real Doctor Consultation</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                <input
                  type="text"
                  value={bookingData.doctorName}
                  onChange={(e) => setBookingData({ ...bookingData, doctorName: e.target.value })}
                  placeholder="Dr. Sarah Martinez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingData.scheduledDate}
                  onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Consultation</label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  placeholder="Describe the reason for this consultation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={bookRealDoctorConsultation}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
