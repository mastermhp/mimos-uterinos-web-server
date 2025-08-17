"use client"

import { useState, useEffect } from "react"

export default function ReportsScreen({ user, onBack }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/reports?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      // Fetch user's cycle and symptom data
      const [cycleResponse, symptomResponse] = await Promise.all([
        fetch(`/api/cycles?userId=${user.id || user._id}`),
        fetch(`/api/symptoms?userId=${user.id || user._id}`),
      ])

      const cycleData = await cycleResponse.json()
      const symptomData = await symptomResponse.json()

      const cycles = cycleData.success ? cycleData.data : []
      const symptoms = symptomData.success ? symptomData.data : []

      // Generate report data
      const reportData = {
        totalCycles: cycles.length,
        averageCycleLength:
          cycles.length > 0
            ? Math.round(cycles.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycles.length)
            : 28,
        commonSymptoms: getCommonSymptoms(symptoms),
        cycleRegularity: calculateCycleRegularity(cycles),
        lastPeriodDate: cycles.length > 0 ? cycles[0].startDate : null,
      }

      const insights = [
        `Your average cycle length is ${reportData.averageCycleLength} days, which is ${reportData.averageCycleLength >= 21 && reportData.averageCycleLength <= 35 ? "within normal range" : "outside typical range"}.`,
        `You've tracked ${reportData.totalCycles} cycle${reportData.totalCycles !== 1 ? "s" : ""} so far.`,
        reportData.commonSymptoms.length > 0
          ? `Your most common symptoms include: ${reportData.commonSymptoms.slice(0, 3).join(", ")}.`
          : "No symptoms have been logged yet.",
        `Your cycles appear to be ${reportData.cycleRegularity}.`,
      ]

      // Create report
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          title: `Health Report - ${new Date().toLocaleDateString()}`,
          type: "monthly_summary",
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          data: reportData,
          insights: insights,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReports((prev) => [data.data, ...prev])
        alert("Report generated successfully!")
      } else {
        alert("Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error generating report")
    } finally {
      setGenerating(false)
    }
  }

  const getCommonSymptoms = (symptoms) => {
    const symptomCounts = {}
    symptoms.forEach((entry) => {
      if (entry.symptoms && Array.isArray(entry.symptoms)) {
        entry.symptoms.forEach((symptom) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
        })
      }
    })

    return Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([symptom]) => symptom)
  }

  const calculateCycleRegularity = (cycles) => {
    if (cycles.length < 2) return "insufficient data"

    const lengths = cycles.map((cycle) => cycle.cycleLength || 28)
    const variance =
      lengths.reduce((sum, length) => {
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
        return sum + Math.pow(length - avg, 2)
      }, 0) / lengths.length

    if (variance <= 4) return "very regular"
    if (variance <= 9) return "fairly regular"
    return "irregular"
  }

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center">
              <button onClick={() => setSelectedReport(null)} className="mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Report Details</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Report Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{selectedReport.title}</h2>
            <p className="text-sm text-gray-500">
              Generated on {new Date(selectedReport.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{selectedReport.data.totalCycles}</div>
                <div className="text-sm text-gray-500">Cycles Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedReport.data.averageCycleLength}</div>
                <div className="text-sm text-gray-500">Avg Cycle Length</div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Insights</h3>
            <div className="space-y-3">
              {selectedReport.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Symptoms */}
          {selectedReport.data.commonSymptoms && selectedReport.data.commonSymptoms.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {selectedReport.data.commonSymptoms.slice(0, 6).map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
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
            <h1 className="text-xl font-semibold text-gray-800">Health Reports</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Generate Report Button */}
        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {generating ? "Generating Report..." : "Generate New Report"}
        </button>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No Reports Yet</h2>
            <p className="text-gray-600">Generate your first health report to get personalized insights.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Reports</h2>
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                        {report.data.totalCycles || 0} cycles
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {report.data.averageCycleLength || 28} day avg
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
