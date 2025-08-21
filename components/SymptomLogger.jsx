"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Activity, TrendingUp } from "lucide-react"

const SYMPTOM_CATEGORIES = {
  physical: ["Cramps", "Headache", "Bloating", "Breast tenderness", "Fatigue", "Nausea", "Back pain"],
  emotional: ["Mood swings", "Irritability", "Anxiety", "Depression", "Stress", "Emotional sensitivity"],
  other: ["Acne", "Food cravings", "Sleep issues", "Dizziness", "Hot flashes", "Joint pain"],
}

const SEVERITY_LEVELS = [
  { value: 1, label: "Mild", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: 3, label: "Severe", color: "bg-red-100 text-red-800" },
]

export default function SymptomLogger({ userId }) {
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    symptom: "",
    severity: 1,
    category: "physical",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchSymptoms()
  }, [userId])

  const fetchSymptoms = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/symptoms?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSymptoms(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching symptoms:", error)
      // Set mock data for demo
      setSymptoms([
        {
          id: "1",
          symptom: "Cramps",
          severity: 2,
          category: "physical",
          notes: "Mild cramping in the morning",
          date: "2024-01-15",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          symptom: "Mood swings",
          severity: 1,
          category: "emotional",
          notes: "Feeling a bit emotional today",
          date: "2024-01-14",
          createdAt: "2024-01-14",
        },
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, userId }),
      })

      if (response.ok) {
        await fetchSymptoms()
        setShowForm(false)
        setFormData({
          symptom: "",
          severity: 1,
          category: "physical",
          notes: "",
          date: new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error saving symptom:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity) => {
    const level = SEVERITY_LEVELS.find((l) => l.value === severity)
    return level ? { label: level.label, color: level.color } : { label: "Unknown", color: "bg-gray-100 text-gray-800" }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "physical":
        return "bg-blue-100 text-blue-800"
      case "emotional":
        return "bg-purple-100 text-purple-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Symptom Logger</h2>
          <p className="text-gray-600">Track your symptoms and get AI-powered insights</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Symptom
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log New Symptom</CardTitle>
            <CardDescription>Record how you're feeling today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, symptom: "" })}
                  >
                    <option value="physical">Physical</option>
                    <option value="emotional">Emotional</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptom">Symptom</Label>
                  <select
                    id="symptom"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.symptom}
                    onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                    required
                  >
                    <option value="">Select a symptom</option>
                    {SYMPTOM_CATEGORIES[formData.category].map((symptom) => (
                      <option key={symptom} value={symptom}>
                        {symptom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <select
                    id="severity"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: Number.parseInt(e.target.value) })}
                  >
                    {SEVERITY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Any additional details about this symptom..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Symptom"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {symptoms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No symptoms logged yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start tracking your symptoms to get personalized AI insights
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Symptom
              </Button>
            </CardContent>
          </Card>
        ) : (
          symptoms.map((symptom) => (
            <Card key={symptom.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Activity className="h-5 w-5 text-pink-500" />
                    <div>
                      <h3 className="font-medium">{symptom.symptom}</h3>
                      <p className="text-sm text-gray-600">{new Date(symptom.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(symptom.category)}>{symptom.category}</Badge>
                    <Badge className={getSeverityBadge(symptom.severity).color}>
                      {getSeverityBadge(symptom.severity).label}
                    </Badge>
                  </div>
                </div>
                {symptom.notes && <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{symptom.notes}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Symptom Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{symptoms.length}</div>
                <p className="text-sm text-gray-600">Total Symptoms</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {symptoms.filter((s) => s.category === "physical").length}
                </div>
                <p className="text-sm text-gray-600">Physical Symptoms</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {symptoms.filter((s) => s.severity >= 2).length}
                </div>
                <p className="text-sm text-gray-600">Moderate+ Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
