"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Plus, Edit, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CycleTracker({ userId }) {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    cycleLength: 28,
    flowIntensity: "medium",
    notes: "",
  })

  useEffect(() => {
    fetchCycles()
  }, [userId])

  const fetchCycles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/cycles?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCycles(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching cycles:", error)
      // Set mock data for demo
      setCycles([
        {
          id: "1",
          startDate: "2024-01-15",
          endDate: "2024-01-20",
          cycleLength: 28,
          flowIntensity: "medium",
          notes: "Normal cycle",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          startDate: "2024-02-12",
          endDate: "2024-02-17",
          cycleLength: 28,
          flowIntensity: "heavy",
          notes: "Heavier than usual",
          createdAt: "2024-02-12",
        },
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, userId }),
      })

      if (response.ok) {
        await fetchCycles()
        setShowForm(false)
        setFormData({
          startDate: "",
          endDate: "",
          cycleLength: 28,
          flowIntensity: "medium",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error saving cycle:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFlowColor = (intensity) => {
    switch (intensity) {
      case "light":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "heavy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cycle Tracker</h2>
          <p className="text-gray-600">Track your menstrual cycles and patterns</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Log New Cycle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log New Cycle</CardTitle>
            <CardDescription>Record your period start and end dates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    min="21"
                    max="35"
                    value={formData.cycleLength}
                    onChange={(e) => setFormData({ ...formData, cycleLength: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flowIntensity">Flow Intensity</Label>
                  <select
                    id="flowIntensity"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.flowIntensity}
                    onChange={(e) => setFormData({ ...formData, flowIntensity: e.target.value })}
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Any additional notes about this cycle..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Cycle"}
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
        {cycles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cycles recorded yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start tracking your menstrual cycles to get personalized insights
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Cycle
              </Button>
            </CardContent>
          </Card>
        ) : (
          cycles.map((cycle) => (
            <Card key={cycle.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    <div>
                      <h3 className="font-medium">
                        {new Date(cycle.startDate).toLocaleDateString()} -{" "}
                        {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : "Ongoing"}
                      </h3>
                      <p className="text-sm text-gray-600">Cycle length: {cycle.cycleLength} days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getFlowColor(cycle.flowIntensity)}>{cycle.flowIntensity} flow</Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {cycle.notes && <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{cycle.notes}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Cycle Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cycles.reduce((sum, cycle) => sum + cycle.cycleLength, 0) / cycles.length || 0}
                </div>
                <p className="text-sm text-gray-600">Average Cycle Length</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{cycles.length}</div>
                <p className="text-sm text-gray-600">Cycles Tracked</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cycles.filter((c) => c.flowIntensity === "heavy").length}
                </div>
                <p className="text-sm text-gray-600">Heavy Flow Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
