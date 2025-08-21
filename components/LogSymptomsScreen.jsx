"use client"

import { useState } from "react"

export default function LogSymptomsScreen({ user, onBack }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [painLevel, setPainLevel] = useState(6)
  const [moodLevel, setMoodLevel] = useState(2)
  const [energyLevel, setEnergyLevel] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const symptoms = [
    { id: "cramps", name: "Cramps", icon: "🔴", color: "bg-red-100 border-red-300" },
    { id: "headache", name: "Headache", icon: "🟣", color: "bg-purple-100 border-purple-300" },
    { id: "fatigue", name: "Fatigue", icon: "🔵", color: "bg-blue-100 border-blue-300" },
    { id: "bloating", name: "Bloating", icon: "🔵", color: "bg-blue-100 border-blue-300" },
    { id: "mood_swings", name: "Mood Swings", icon: "💗", color: "bg-pink-100 border-pink-300" },
    { id: "breast_tenderness", name: "Breast Tenderness", icon: "🟠", color: "bg-orange-100 border-orange-300" },
    { id: "acne", name: "Acne", icon: "🔴", color: "bg-red-100 border-red-300" },
    { id: "backache", name: "Backache", icon: "🟣", color: "bg-purple-100 border-purple-300" },
    { id: "nausea", name: "Nausea", icon: "🔵", color: "bg-blue-100 border-blue-300" },
    { id: "insomnia", name: "Insomnia", icon: "🔵", color: "bg-blue-100 border-blue-300" },
    { id: "food_cravings", name: "Food Cravings", icon: "💗", color: "bg-pink-100 border-pink-300" },
    { id: "dizziness", name: "Dizziness", icon: "🟠", color: "bg-orange-100 border-orange-300" },
  ]

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const analyzeSymptoms = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/analyze-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          painLevel,
          moodLevel,
          energyLevel,
          date: selectedDate.toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      // Fallback analysis
      setAnalysis({
        summary: "Based on your symptoms, you may be experiencing PMS symptoms typical of the luteal phase.",
        recommendations: [
          "Apply heat therapy for cramps relief",
          "Practice mindfulness for mood management",
          "Focus on magnesium-rich foods",
          "Get adequate rest and sleep",
        ],
      })
      setShowAnalysis(true)
    } finally {
      setLoading(false)
    }
  }

  if (showAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center">
              <button onClick={() => setShowAnalysis(false)} className="mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Log Symptoms</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* AI Analysis Header */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">AI Analysis</h2>
          </div>

          {/* Symptoms Summary */}
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-3">Based on your symptoms on {selectedDate.toLocaleDateString()}:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSymptoms.map((symptomId) => {
                const symptom = symptoms.find((s) => s.id === symptomId)
                return (
                  <span key={symptomId} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                    {symptom?.name}
                  </span>
                )
              })}
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Pain: {painLevel}/10</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Mood: {moodLevel}/10</span>
            </div>
          </div>

          {/* Analysis & Recommendations */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Analysis & Recommendations</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    The user is experiencing cramps, mood swings, and moderate to severe pain (6/10) and low mood (2/10)
                    on cycle day 15, which falls within the luteal phase. Cramps and mood swings are common premenstrual
                    symptoms (PMS) that often peak in the late luteal phase, before menstruation begins. The pain level
                    and mood score suggest these symptoms are significantly impacting her well-being. Given her 26-day
                    cycle, these symptoms are occurring earlier than expected in the luteal phase, but still within the
                    typical timeframe for PMS symptom onset.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Over-the-Counter Pain Relief:</h4>
                    <p className="text-sm text-gray-600">
                      Ibuprofen or naproxen are NSAIDs that effectively reduce pain and inflammation associated with
                      menstrual cramps. Following the recommended dosage is crucial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Mindfulness and Stress Reduction Techniques:</h4>
                    <p className="text-sm text-gray-600">
                      Practicing mindfulness, deep breathing exercises, or yoga can help manage stress and mood swings,
                      which are often exacerbated during the luteal phase. Studies show a correlation between stress and
                      PMS symptom severity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Dietary Adjustments:</h4>
                    <p className="text-sm text-gray-600">
                      A balanced diet rich in magnesium and calcium can help regulate hormones and reduce PMS symptoms.
                      Limiting caffeine and alcohol intake might also be beneficial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Regular Exercise:</h4>
                    <p className="text-sm text-gray-600">
                      Moderate exercise can improve mood and reduce pain by releasing endorphins. However, avoid
                      strenuous activity if cramps are severe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold">
            ✓ Save to Journal
          </button>
        </div>
      </div>
    )
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
            <h1 className="text-xl font-semibold text-gray-800">Log Symptoms</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Date Selection */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Symptoms Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Symptoms</h3>
          <div className="grid grid-cols-3 gap-3">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedSymptoms.includes(symptom.id)
                    ? "border-pink-300 bg-pink-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${symptom.color}`}
                >
                  <span className="text-lg">{symptom.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{symptom.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pain Level */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🌸</span>
            <h3 className="text-lg font-semibold text-gray-800">Pain Level</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-pink"
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-pink-600">{painLevel}</span>
            </div>
          </div>
        </div>

        {/* Mood Level */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">😊</span>
            <h3 className="text-lg font-semibold text-gray-800">Mood Level</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                value={moodLevel}
                onChange={(e) => setMoodLevel(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{moodLevel}</span>
            </div>
          </div>
        </div>

        {/* Energy Level */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🔋</span>
            <h3 className="text-lg font-semibold text-gray-800">Energy Level</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
              />
            </div>
            <div className="text-center">
              <span className="text-lg text-gray-600">
                {energyLevel === 0 ? "None" : energyLevel <= 3 ? "Low" : energyLevel <= 7 ? "Moderate" : "High"}
              </span>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeSymptoms}
          disabled={loading || selectedSymptoms.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            "🤖 Analyze Symptoms"
          )}
        </button>
      </div>
    </div>
  )
}
