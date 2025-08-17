"use client"

import { useState, useEffect } from "react"

export default function CycleCalendarScreen({ user, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [cycleData, setCycleData] = useState(null)
  const [showSetPeriodModal, setShowSetPeriodModal] = useState(false)
  const [newPeriodDate, setNewPeriodDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchCycleData()
  }, [])

  const fetchCycleData = async () => {
    try {
      const response = await fetch(`/api/cycles?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setCycleData(data.data[0])
      }
    } catch (error) {
      console.error("Error fetching cycle data:", error)
    }
  }

  const handleSetPeriodDate = async () => {
    try {
      const response = await fetch("/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          startDate: newPeriodDate,
          cycleLength: user.cycleLength || 28,
          periodLength: user.periodLength || 5,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCycleData(data.data)
        setShowSetPeriodModal(false)
        alert("Period date set successfully!")
      } else {
        alert("Failed to set period date")
      }
    } catch (error) {
      console.error("Error setting period date:", error)
      alert("Error setting period date")
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const calculateCyclePredictions = () => {
    const lastPeriodDate = cycleData?.startDate || user.lastPeriodDate
    const cycleLength = cycleData?.cycleLength || user.cycleLength

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

    // Calculate ovulation (typically 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate)
    ovulationDate.setDate(nextPeriodDate.getDate() - 14)

    // Calculate fertile window (5 days before ovulation + ovulation day)
    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(ovulationDate.getDate() - 5)
    const fertileEnd = new Date(ovulationDate)
    fertileEnd.setDate(ovulationDate.getDate() + 1)

    return {
      nextPeriodDate,
      ovulationDate,
      fertileStart,
      fertileEnd,
      nextPeriod: `Likely to start around ${nextPeriodDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      ovulation: `Expected around ${ovulationDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      fertileWindow: `${fertileStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${fertileEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (6 days)`,
    }
  }

  const getDayType = (day) => {
    const predictions = calculateCyclePredictions()
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    if (!predictions.nextPeriodDate) return null

    const lastPeriodDate = cycleData?.startDate || user.lastPeriodDate
    const periodLength = cycleData?.periodLength || user.periodLength || 5

    if (lastPeriodDate) {
      const periodStart = new Date(lastPeriodDate)
      const periodEnd = new Date(periodStart)
      periodEnd.setDate(periodStart.getDate() + periodLength)

      if (dayDate >= periodStart && dayDate <= periodEnd) {
        return "period"
      }
    }

    // Check if it's in fertile window
    if (dayDate >= predictions.fertileStart && dayDate <= predictions.fertileEnd) {
      return "fertile"
    }

    // Check if it's ovulation day
    if (dayDate.toDateString() === predictions.ovulationDate.toDateString()) {
      return "ovulation"
    }

    return null
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date()
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

      const dayType = getDayType(day)

      let dayClass = "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium "

      if (isToday) {
        dayClass += "bg-gray-800 text-white "
      } else if (dayType === "period") {
        dayClass += "bg-pink-200 text-pink-800 "
      } else if (dayType === "fertile") {
        dayClass += "bg-green-200 text-green-800 "
      } else if (dayType === "ovulation") {
        dayClass += "bg-purple-200 text-purple-800 "
      } else {
        dayClass += "text-gray-700 hover:bg-gray-100 "
      }

      days.push(
        <div key={day} className={dayClass}>
          {day}
        </div>,
      )
    }

    return days
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const predictions = calculateCyclePredictions()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">My Cycle</h1>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Track your period and symptoms</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <span className="text-sm text-pink-600 font-medium">2 weeks</span>
          </div>

          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-200 rounded-full"></div>
            <span className="text-gray-600">Period</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded-full"></div>
            <span className="text-gray-600">Fertile Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-200 rounded-full"></div>
            <span className="text-gray-600">Ovulation</span>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-lg font-semibold">AI Prediction</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
                <span className="font-medium">Next Period</span>
              </div>
              <span className="text-white/90 text-sm">{predictions.nextPeriod}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8z" />
                </svg>
                <span className="font-medium">Ovulation Window</span>
              </div>
              <span className="text-white/90 text-sm">{predictions.ovulation}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-medium">Fertile Days</span>
              </div>
              <span className="text-white/90 text-sm">{predictions.fertileWindow}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-white/80 text-sm leading-relaxed">
              Predictions improve with more cycle data. Log your periods regularly for better accuracy.
            </p>
          </div>
        </div>

        {/* Cycle Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Cycle Length</p>
              <p className="font-semibold text-gray-800">{cycleData?.cycleLength || user.cycleLength || 28} days</p>
            </div>

            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Period Length</p>
              <p className="font-semibold text-gray-800">{cycleData?.periodLength || user.periodLength || 5} days</p>
            </div>

            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Ovulation</p>
              <p className="font-semibold text-purple-600">Day 14</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onBack()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Log Symptoms</span>
          </button>

          <button
            onClick={() => setShowSetPeriodModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Set Period Date</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Doctor Mode</span>
          </button>

          <button className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
              />
            </svg>
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {showSetPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 m-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Set Period Start Date</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Start Date</label>
              <input
                type="date"
                value={newPeriodDate}
                onChange={(e) => setNewPeriodDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSetPeriodModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSetPeriodDate}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Set Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
