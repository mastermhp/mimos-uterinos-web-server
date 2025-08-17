"use client"

import { useState, useEffect } from "react"
import LogSymptomsScreen from "./LogSymptomsScreen"
import CycleCalendarScreen from "./CycleCalendarScreen"
import AIChatScreen from "./AIChatScreen"
import ReportsScreen from "./ReportsScreen"
import DoctorModeScreen from "./DoctorModeScreen"
import ProfileScreen from "./ProfileScreen"
import SettingsScreen from "./SettingsScreen"
import EditProfileScreen from "./EditProfileScreen"
import PremiumScreen from "./PremiumScreen"
import RemindersScreen from "./RemindersScreen"

export default function Dashboard({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState("home")
  const [userData, setUserData] = useState(user)
  const [cycleData, setCycleData] = useState(null)
  const [aiInsights, setAiInsights] = useState("")
  const [cyclePredictions, setCyclePredictions] = useState("")
  const [recommendations, setRecommendations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("Nutrition")
  const [loading, setLoading] = useState(true)

  const renderScreen = () => {
    switch (currentScreen) {
      case "symptoms":
        return <LogSymptomsScreen user={userData} onBack={() => setCurrentScreen("home")} />
      case "calendar":
        return <CycleCalendarScreen user={userData} onBack={() => setCurrentScreen("home")} />
      case "chat":
        return <AIChatScreen user={userData} onBack={() => setCurrentScreen("home")} />
      case "reports":
        return <ReportsScreen user={userData} onBack={() => setCurrentScreen("home")} />
      case "doctor":
        return <DoctorModeScreen user={userData} onBack={() => setCurrentScreen("home")} />
      case "profile":
        return <ProfileScreen user={userData} onNavigate={setCurrentScreen} />
      case "settings":
        return <SettingsScreen onBack={() => setCurrentScreen("profile")} onNavigate={setCurrentScreen} />
      case "edit-profile":
        return (
          <EditProfileScreen
            user={userData}
            onBack={() => setCurrentScreen("settings")}
            onSave={(updatedData) => {
              setUserData({ ...userData, ...updatedData })
              fetchDashboardData() // Refresh all data including cycle predictions
            }}
          />
        )
      case "premium":
        return <PremiumScreen onBack={() => setCurrentScreen("settings")} />
      case "reminders":
        return <RemindersScreen onBack={() => setCurrentScreen("settings")} />
      default:
        return renderHomeScreen()
    }
  }

  const renderHomeScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-200 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="max-w-md mx-auto px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">Hello, {userData.name}!</h1>
                <p className="text-pink-100">
                  Day {calculateCycleDay()} of your cycle • {calculateDaysUntilNext()} days until next period
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7H4l5-5v5z" />
                  </svg>
                </button>
                <button onClick={onLogout} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="flex justify-between items-center text-sm mb-4">
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
              <span>M</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl">9</span>
              <span className="text-2xl">1</span>
              <span className="text-2xl">11</span>
              <span className="text-2xl">1</span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">TODAY</span>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 font-bold">
                {new Date().getDate()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* App Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Mimos Uterinos</h2>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentScreen("symptoms")}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Log Symptoms</span>
              </button>

              <button
                onClick={() => setCurrentScreen("calendar")}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">View Calendar</span>
              </button>

              <button
                onClick={() => setCurrentScreen("chat")}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">AI Coach</span>
              </button>

              <button
                onClick={() => setCurrentScreen("profile")}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </button>
            </div>
          </div>

          {/* Cycle Predictions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cycle Predictions</h3>
              <button onClick={() => setCurrentScreen("calendar")} className="text-pink-600 text-sm font-medium">
                View Calendar
              </button>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white space-y-4">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                <span className="text-lg font-semibold">Cycle Predictions</span>
              </div>

              {(() => {
                const predictions = calculateCyclePredictions()
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                        </svg>
                        <span className="font-medium">Next Period</span>
                      </div>
                      <span className="text-white/90">{predictions.nextPeriod}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8z" />
                        </svg>
                        <span className="font-medium">Ovulation</span>
                      </div>
                      <span className="text-white/90">{predictions.ovulation}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="font-medium">Fertile Window</span>
                      </div>
                      <span className="text-white/90">{predictions.fertileWindow}</span>
                    </div>
                  </div>
                )
              })()}

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/80 text-sm leading-relaxed">
                  Predictions improve with more cycle data. Log your periods regularly for better accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Today's Insights */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Today's Insights</h3>
              <button className="text-pink-600 text-sm font-medium">Ask AI Coach</button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">AI Insights</h4>
                  <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                    {aiInsights ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiInsights.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">• Physical Well-being:</span> You might experience bloating or
                          breast tenderness as progesterone levels are high in your luteal phase. Staying hydrated and
                          wearing comfortable clothing can help alleviate these common symptoms.
                        </div>
                        <div>
                          <span className="font-medium">• Emotional Well-being:</span> Some individuals experience
                          increased irritability or mood swings during the luteal phase due to hormonal fluctuations.
                          Practicing mindfulness or engaging in relaxing activities can help manage these changes.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
              <div className="flex items-center text-yellow-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium">Premium</span>
              </div>
            </div>

            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {recommendations.map((rec, index) => (
                <button
                  key={rec.category}
                  onClick={() => handleCategoryClick(rec.category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    rec.category === selectedCategory
                      ? "bg-pink-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {rec.category}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {recommendations.find((rec) => rec.category === selectedCategory)?.text ||
                      "Focus on Magnesium-rich foods: The luteal phase can bring on PMS symptoms like bloating and cramping. Magnesium helps relax muscles and reduce discomfort."}
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    Upgrade to Premium for more personalized recommendations
                  </span>
                </div>
                <button className="text-pink-600 text-sm font-semibold">Upgrade</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch cycle data
      const cycleResponse = await fetch(`/api/cycles?userId=${userData.id || userData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const cycleData = await cycleResponse.json()

      if (cycleData.success && cycleData.data.length > 0) {
        setCycleData(cycleData.data[0])
      }

      // Get AI insights and predictions
      const insightsResponse = await fetch(`/api/ai/insights?userId=${userData.id || userData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const insightsData = await insightsResponse.json()

      if (insightsData.success) {
        setAiInsights(insightsData.insights)
        setCyclePredictions(
          insightsData.cyclePredictions ||
            "Predictions improve with more cycle data. Log your periods regularly for better accuracy.",
        )
        setRecommendations(
          insightsData.recommendations || [
            {
              category: "Nutrition",
              text: "Focus on Magnesium-rich foods. The luteal phase can bring on PMS symptoms like bloating and cramping. Magnesium helps relax muscles and reduce discomfort.",
            },
            {
              category: "Exercise",
              text: "Light yoga or walking can help manage PMS symptoms and improve mood during this phase.",
            },
            {
              category: "Sleep",
              text: "Maintain consistent sleep schedule. Hormonal changes can affect sleep quality during different cycle phases.",
            },
            {
              category: "Self-Care",
              text: "Practice mindfulness and stress management techniques to support emotional well-being.",
            },
          ],
        )
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setCyclePredictions("Predictions improve with more cycle data. Log your periods regularly for better accuracy.")
      setAiInsights(
        "Hello! Here are some personalized insights for you today based on your cycle data and health patterns.",
      )
      setRecommendations([
        {
          category: "Nutrition",
          text: "Focus on Magnesium-rich foods. The luteal phase can bring on PMS symptoms like bloating and cramping. Magnesium helps relax muscles and reduce discomfort.",
        },
        {
          category: "Exercise",
          text: "Light yoga or walking can help manage PMS symptoms and improve mood during this phase.",
        },
        {
          category: "Sleep",
          text: "Maintain consistent sleep schedule. Hormonal changes can affect sleep quality during different cycle phases.",
        },
        {
          category: "Self-Care",
          text: "Practice mindfulness and stress management techniques to support emotional well-being.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const calculateCycleDay = () => {
    if (!cycleData?.startDate) return 15
    const start = new Date(cycleData.startDate)
    const today = new Date()
    const diffTime = Math.abs(today - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateDaysUntilNext = () => {
    if (!cycleData?.cycleLength) return 12
    const cycleDay = calculateCycleDay()
    return Math.max(0, cycleData.cycleLength - cycleDay)
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
  }

  const calculateCyclePredictions = () => {
    let lastPeriodDate, cycleLength, periodLength

    // First try to get data from cycleData (from cycles collection)
    if (cycleData?.startDate && cycleData?.cycleLength) {
      lastPeriodDate = cycleData.startDate
      cycleLength = cycleData.cycleLength
      periodLength = cycleData.periodLength || 5
    }
    // Fallback to userData (from user profile)
    else if (userData?.lastPeriodDate && userData?.cycleLength) {
      lastPeriodDate = userData.lastPeriodDate
      cycleLength = userData.cycleLength
      periodLength = userData.periodLength || 5
    }
    // Check if user has profile data with cycle info
    else if (userData?.profile?.lastPeriodDate && userData?.profile?.cycleLength) {
      lastPeriodDate = userData.profile.lastPeriodDate
      cycleLength = userData.profile.cycleLength
      periodLength = userData.profile.periodLength || 5
    }

    if (!lastPeriodDate || !cycleLength) {
      return {
        nextPeriod: "Track your cycle for predictions",
        ovulation: "Log periods for ovulation tracking",
        fertileWindow: "Complete cycle data needed",
      }
    }

    const lastPeriod = new Date(lastPeriodDate)
    const today = new Date()

    // Calculate next period
    const nextPeriodDate = new Date(lastPeriod)
    nextPeriodDate.setDate(lastPeriod.getDate() + cycleLength)
    const daysToNextPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24))

    // Calculate ovulation (typically 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate)
    ovulationDate.setDate(nextPeriodDate.getDate() - 14)
    const daysToOvulation = Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24))

    // Calculate fertile window (5 days before ovulation + ovulation day)
    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(ovulationDate.getDate() - 5)
    const fertileEnd = new Date(ovulationDate)
    fertileEnd.setDate(ovulationDate.getDate() + 1)

    const isInFertileWindow = today >= fertileStart && today <= fertileEnd
    const daysToFertileWindow = isInFertileWindow ? 0 : Math.ceil((fertileStart - today) / (1000 * 60 * 60 * 24))

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return {
      nextPeriod:
        daysToNextPeriod > 0 ? `Likely to start around ${formatDate(nextPeriodDate)}` : "Period expected soon",
      ovulation:
        daysToOvulation > 0
          ? `Expected around ${formatDate(ovulationDate)}`
          : daysToOvulation === 0
            ? "Today"
            : "Ovulation passed",
      fertileWindow: isInFertileWindow
        ? `${formatDate(fertileStart)}-${formatDate(fertileEnd)} (Active now)`
        : daysToFertileWindow > 0
          ? `${formatDate(fertileStart)}-${formatDate(fertileEnd)} (${Math.abs(fertileEnd - fertileStart) / (1000 * 60 * 60 * 24)} days)`
          : "Window passed",
    }
  }

  return (
    <div className="relative">
      {renderScreen()}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex justify-around">
            <button
              onClick={() => setCurrentScreen("home")}
              className={`p-3 rounded-full ${currentScreen === "home" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentScreen("calendar")}
              className={`p-3 rounded-full ${currentScreen === "calendar" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentScreen("reports")}
              className={`p-3 rounded-full ${currentScreen === "reports" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentScreen("chat")}
              className={`p-3 rounded-full ${currentScreen === "chat" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentScreen("profile")}
              className={`p-3 rounded-full ${currentScreen === "profile" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
