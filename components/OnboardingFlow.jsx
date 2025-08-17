"use client"

import { useState } from "react"

const ONBOARDING_STEPS = [
  { id: 1, title: "What's your name?", type: "text" },
  { id: 2, title: "How old are you?", type: "age" },
  { id: 3, title: "When is your birthday?", type: "birthday" },
  { id: 4, title: "What's your weight?", type: "weight" },
  { id: 5, title: "How tall are you?", type: "height" },
  { id: 6, title: "How long does your period usually last?", type: "period" },
  { id: 7, title: "How long does your cycle usually last?", type: "cycle" },
  { id: 8, title: "When did your last period start?", type: "lastPeriod" },
  { id: 9, title: "What symptoms do you typically experience?", type: "symptoms" },
  { id: 10, title: "Your Health Metrics", type: "health" },
]

const SYMPTOMS = ["Cramps", "Headache", "Bloating", "Fatigue", "Breast Tenderness", "Acne", "Backache", "Nausea"]
const MOODS = ["Happy", "Calm", "Irritable", "Anxious", "Sad", "Energetic", "Tired", "Emotional"]

export default function OnboardingFlow({ onComplete, userName = "" }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: userName,
    age: 25,
    birthMonth: 1,
    birthDay: 1,
    birthYear: 2000,
    weight: 60,
    height: 165,
    periodLength: 4,
    cycleLength: 28,
    isRegularCycle: true,
    lastPeriodDate: new Date().toISOString().split("T")[0], // Default to today
    symptoms: [],
    moods: [],
    painLevel: 3,
    energyLevel: 4,
    sleepQuality: 3,
  })

  const isStepValid = () => {
    const step = ONBOARDING_STEPS[currentStep - 1]
    switch (step.type) {
      case "text":
        return formData.name.trim().length > 0
      case "lastPeriod":
        return formData.lastPeriodDate && formData.lastPeriodDate.trim().length > 0
      case "symptoms":
        return formData.symptoms.length > 0 && formData.moods.length > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!isStepValid()) return

    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const calculateAge = () => {
    const today = new Date()
    const birthDate = new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, "0")}-${String(formData.birthDay).padStart(2, "0")}`

      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          birthDate,
          age: calculateAge(),
          lastPeriodDate: formData.lastPeriodDate,
          symptoms: formData.symptoms.map((s) => ({ name: s, intensity: 3 })),
          moods: formData.moods.map((m) => ({ name: m, intensity: 3 })),
          healthConditions: [],
          goals: ["Track cycle", "Monitor symptoms"],
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Get AI personalization
        await fetch("/api/ai/personalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, birthDate, age: calculateAge() }),
        })

        onComplete()
      }
    } catch (error) {
      console.error("Onboarding error:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep - 1]

    switch (step.type) {
      case "text":
        return (
          <div className="space-y-8">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={`w-full text-2xl text-center border-b-2 focus:border-pink-500 outline-none py-4 bg-transparent ${
                userName ? "border-gray-200 text-gray-600 cursor-not-allowed" : "border-gray-300"
              }`}
              placeholder="Enter your name"
              disabled={!!userName}
              required
            />
            {userName && <p className="text-sm text-gray-500 text-center">Name from your account registration</p>}
          </div>
        )

      case "age":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-6 mb-8">
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, age: Math.max(12, prev.age - 1) }))}
                  className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  -
                </button>
                <div className="text-6xl font-light">{formData.age}</div>
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, age: Math.min(70, prev.age + 1) }))}
                  className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-xl font-bold hover:bg-pink-600 transition-colors"
                >
                  +
                </button>
              </div>
              <input
                type="range"
                min="12"
                max="70"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>12</span>
                <span>30</span>
                <span>50</span>
                <span>70</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                Your age helps us provide more accurate cycle predictions and health insights.
              </p>
            </div>
          </div>
        )

      case "birthday":
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        const days = Array.from({ length: 31 }, (_, i) => i + 1)
        const years = Array.from({ length: 50 }, (_, i) => 2024 - i)
        const calculatedAge = calculateAge()

        return (
          <div className="space-y-8">
            <div className="flex justify-center space-x-4">
              {/* Month Picker */}
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Month</div>
                <select
                  value={formData.birthMonth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthMonth: Number(e.target.value) }))}
                  className="text-2xl font-light bg-transparent border-none outline-none cursor-pointer"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {String(month).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Picker */}
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Day</div>
                <select
                  value={formData.birthDay}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDay: Number(e.target.value) }))}
                  className="text-2xl font-light bg-transparent border-none outline-none cursor-pointer"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {String(day).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Picker */}
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Year</div>
                <select
                  value={formData.birthYear}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthYear: Number(e.target.value) }))}
                  className="text-2xl font-light bg-transparent border-none outline-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <span className="text-pink-700 font-medium">You are {calculatedAge} years old</span>
            </div>
          </div>
        )

      case "weight":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl font-light mb-8">
                {formData.weight}.0 <span className="text-2xl text-gray-500">kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                value={formData.weight}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>30</span>
                <span>60</span>
                <span>90</span>
                <span>120</span>
                <span>150</span>
              </div>
            </div>
          </div>
        )

      case "height":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl font-light mb-8">
                {formData.height}.0 <span className="text-2xl text-gray-500">cm</span>
              </div>
              <input
                type="range"
                min="120"
                max="200"
                value={formData.height}
                onChange={(e) => setFormData((prev) => ({ ...prev, height: Number.parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>120</span>
                <span>140</span>
                <span>160</span>
                <span>180</span>
                <span>200</span>
              </div>
            </div>
          </div>
        )

      case "period":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setFormData((prev) => ({ ...prev, periodLength: days }))}
                  className={`p-6 rounded-2xl border-2 text-lg font-medium transition-all ${
                    formData.periodLength === days
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-white border-gray-200 hover:border-pink-300"
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
        )

      case "cycle":
        return (
          <div className="space-y-8">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setFormData((prev) => ({ ...prev, isRegularCycle: true }))}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  formData.isRegularCycle ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setFormData((prev) => ({ ...prev, isRegularCycle: false }))}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  !formData.isRegularCycle ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Irregular
              </button>
            </div>

            {formData.isRegularCycle ? (
              <div className="grid grid-cols-3 gap-4">
                {[24, 25, 26, 27, 28, 29, 30, 31].map((days) => (
                  <button
                    key={days}
                    onClick={() => setFormData((prev) => ({ ...prev, cycleLength: days }))}
                    className={`p-4 rounded-xl border-2 text-lg font-medium transition-all ${
                      formData.cycleLength === days
                        ? "bg-pink-100 text-pink-700 border-pink-300"
                        : "bg-white border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center">Select your typical cycle length range</p>
                <div className="grid grid-cols-2 gap-4">
                  {["20-25 days", "26-30 days", "31-35 days", "35+ days"].map((range, index) => (
                    <button
                      key={range}
                      onClick={() => setFormData((prev) => ({ ...prev, cycleLength: [22, 28, 33, 37][index] }))}
                      className={`p-4 rounded-xl border-2 text-lg font-medium transition-all ${
                        formData.cycleLength === [22, 28, 33, 37][index]
                          ? "bg-pink-100 text-pink-700 border-pink-300"
                          : "bg-white border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <span className="text-pink-700 font-medium">
                {formData.isRegularCycle ? `${formData.cycleLength} days` : `${formData.cycleLength} days average`}
              </span>
            </div>
          </div>
        )

      case "lastPeriod":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <input
                type="date"
                value={formData.lastPeriodDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastPeriodDate: e.target.value }))}
                className="text-2xl text-center border-2 border-gray-300 focus:border-pink-500 outline-none py-4 px-6 bg-white rounded-xl"
                max={new Date().toISOString().split("T")[0]} // Can't select future dates
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                This helps us predict your next period, ovulation, and fertile window accurately.
              </p>
            </div>
          </div>
        )

      case "symptoms":
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        symptoms: prev.symptoms.includes(symptom)
                          ? prev.symptoms.filter((s) => s !== symptom)
                          : [...prev.symptoms, symptom],
                      }))
                    }}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.symptoms.includes(symptom)
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">How would you describe your typical mood?</h3>
                <div className="flex flex-wrap gap-3">
                  {MOODS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          moods: prev.moods.includes(mood)
                            ? prev.moods.filter((m) => m !== mood)
                            : [...prev.moods, mood],
                        }))
                      }}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        formData.moods.includes(mood)
                          ? "bg-pink-100 border-pink-300 text-pink-700"
                          : "bg-white border-gray-300 text-gray-700 hover:border-pink-300"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                This information helps us provide more personalized insights about your cycle.
              </p>
            </div>
          </div>
        )

      case "health":
        return (
          <div className="space-y-8">
            <p className="text-gray-600 text-center">Help us understand your typical health patterns</p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Pain Level</span>
                  <span className="text-pink-600 font-medium">
                    {["None", "Mild", "Moderate", "Severe", "Extreme"][formData.painLevel - 1]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.painLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, painLevel: Number.parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Extreme</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Energy Level</span>
                  <span className="text-pink-600 font-medium">
                    {["Very Low", "Low", "Moderate", "High", "Very High"][formData.energyLevel - 1]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.energyLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, energyLevel: Number.parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Sleep Quality</span>
                  <span className="text-pink-600 font-medium">
                    {["Very Poor", "Poor", "Fair", "Good", "Excellent"][formData.sleepQuality - 1]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.sleepQuality}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sleepQuality: Number.parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? "Creating your AI profile..." : "AI Personalization"}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={currentStep === 1}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-gray-600 font-medium">{currentStep}/10</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{ONBOARDING_STEPS[currentStep - 1].title}</h1>
        </div>

        {renderStep()}

        {currentStep < 10 && (
          <div className="flex justify-end mt-12">
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isStepValid()
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
