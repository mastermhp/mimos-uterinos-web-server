"use client"

import { useState, useEffect } from "react"

export default function DoctorModeScreen({ user, onBack }) {
  const [consultations, setConsultations] = useState([])
  const [doctorAppointments, setDoctorAppointments] = useState([])
  const [newConsultation, setNewConsultation] = useState({
    symptoms: "",
    severity: 5,
    duration: "",
    notes: "",
  })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState(null)
  const [generatingPrescription, setGeneratingPrescription] = useState(false)
  const [bookingData, setBookingData] = useState({
    doctorName: "",
    type: "virtual",
    scheduledDate: "",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    fetchConsultations()
    fetchDoctorAppointments()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`/api/consultations?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success) {
        const completedConsultations = (data.data || []).filter(
          (consultation) => consultation.status === "completed" && consultation.aiResponse,
        )
        setConsultations(completedConsultations)
      }
    } catch (error) {
      console.error("Error fetching consultations:", error)
    }
  }

  const fetchDoctorAppointments = async () => {
    try {
      const response = await fetch(`/api/doctor/consultations?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success) {
        setDoctorAppointments(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching doctor appointments:", error)
    }
  }

  const submitAIConsultation = async () => {
    if (!newConsultation.symptoms.trim()) return

    setGeneratingPrescription(true)
    try {
      const response = await fetch("/api/ai/doctor-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          symptoms: newConsultation.symptoms,
          severity: newConsultation.severity,
          duration: newConsultation.duration,
          additionalNotes: newConsultation.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentPrescription(data.data)
        setShowPrescriptionModal(true)
        setNewConsultation({ symptoms: "", severity: 5, duration: "", notes: "" })
        fetchConsultations()
      } else {
        alert("Failed to generate AI consultation")
      }
    } catch (error) {
      console.error("Error generating AI consultation:", error)
      alert("Error generating AI consultation")
    } finally {
      setGeneratingPrescription(false)
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
        fetchDoctorAppointments()
        alert("Doctor consultation booked successfully!")
      } else {
        alert("Failed to book consultation")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
      alert("Error booking consultation")
    }
  }

  const generatePDF = () => {
    if (!currentPrescription) return

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Prescription - Mimos Uterinos AI</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .prescription { white-space: pre-line; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
            h1 { color: #8B5CF6; margin: 0; }
            h2 { color: #333; margin-top: 25px; }
            .date { margin-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mimos Uterinos AI</h1>
            <p>AI-Powered Menstrual Health Consultation</p>
            <div class="date">Date: ${new Date(currentPrescription.createdAt).toLocaleDateString()}</div>
          </div>
          
          <h2>Patient Information</h2>
          <p><strong>Patient:</strong> ${user.name || "Patient"}</p>
          <p><strong>Consultation ID:</strong> ${currentPrescription.id}</p>
          
          <h2>Medical Consultation Report</h2>
          <div class="prescription">${currentPrescription.aiResponse}</div>
          
          <div class="footer">
            <p><strong>Disclaimer:</strong> This is an AI-generated consultation for informational purposes only. Please consult with a qualified healthcare provider for proper medical diagnosis and treatment.</p>
            <p>Generated by Mimos Uterinos AI - Menstrual Health Assistant</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
            <button
              onClick={submitAIConsultation}
              disabled={!newConsultation.symptoms.trim() || generatingPrescription}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-xl font-medium flex flex-col items-center space-y-2 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>AI Doctor</span>
              <span className="text-xs opacity-80">
                {generatingPrescription ? "Generating..." : "Get Prescription"}
              </span>
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

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Prescription Request</h2>
          <p className="text-sm text-gray-600 mb-4">
            Fill out your symptoms below and click "AI Doctor" above to get an instant prescription.
          </p>

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
          </div>
        </div>

        {doctorAppointments.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Doctor Appointments</h2>
            <div className="space-y-4">
              {doctorAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.type} consultation</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    📅 {new Date(appointment.scheduledDate).toLocaleString()}
                  </div>
                  {appointment.reason && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{appointment.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Previous AI Prescriptions</h2>

          {consultations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No AI prescriptions yet</p>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Prescription Ready
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{consultation.symptoms}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    Severity: {consultation.severity}/10 • Duration: {consultation.duration}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPrescription(consultation)
                      setShowPrescriptionModal(true)
                    }}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
                  >
                    View Prescription
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ... existing modals code ... */}
      {showPrescriptionModal && currentPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">AI Medical Prescription</h3>
              <div className="flex space-x-2">
                <button
                  onClick={generatePDF}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm"
                >
                  📄 Download PDF
                </button>
                <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="text-center border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-bold text-purple-600">Mimos Uterinos AI</h2>
                <p className="text-sm text-gray-600">AI-Powered Menstrual Health Consultation</p>
                <p className="text-xs text-gray-500 mt-2">
                  Date: {new Date(currentPrescription.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {currentPrescription.aiResponse}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4 text-xs text-gray-500">
                <p>
                  <strong>Disclaimer:</strong> This is an AI-generated consultation for informational purposes only.
                  Please consult with a qualified healthcare provider for proper medical diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
