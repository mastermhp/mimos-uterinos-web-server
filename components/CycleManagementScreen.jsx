"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Plus, Edit, Trash2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const FLOW_OPTIONS = ["spotting", "light", "medium", "heavy"]
const MOOD_OPTIONS = ["happy", "normal", "sad", "irritable", "anxious", "energetic"]

export default function CycleManagementScreen({ user, onBack }) {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    cycleLength: 28,
    periodLength: 5,
    flow: "medium",
    mood: "normal",
    symptoms: [],
    temperature: "",
    notes: "",
  })

  useEffect(() => {
    fetchCycles()
  }, [])

  const fetchCycles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cycles?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success) {
        setCycles(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching cycles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCycle = async () => {
    try {
      const response = await fetch("/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id || user._id,
          temperature: formData.temperature ? Number.parseFloat(formData.temperature) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCycles([data.data, ...cycles])
        setShowAddDialog(false)
        resetForm()
        alert("Cycle added successfully!")
      } else {
        alert("Failed to add cycle")
      }
    } catch (error) {
      console.error("Error adding cycle:", error)
      alert("Error adding cycle")
    }
  }

  const handleEditCycle = async () => {
    if (!selectedCycle) return

    try {
      const response = await fetch(`/api/cycles/${selectedCycle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          temperature: formData.temperature ? Number.parseFloat(formData.temperature) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCycles(cycles.map((cycle) => (cycle.id === selectedCycle.id ? data.data : cycle)))
        setShowEditDialog(false)
        setSelectedCycle(null)
        resetForm()
        alert("Cycle updated successfully!")
      } else {
        alert("Failed to update cycle")
      }
    } catch (error) {
      console.error("Error updating cycle:", error)
      alert("Error updating cycle")
    }
  }

  const handleDeleteCycle = async (cycleId) => {
    if (!confirm("Are you sure you want to delete this cycle?")) return

    try {
      const response = await fetch(`/api/cycles/${cycleId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setCycles(cycles.filter((cycle) => cycle.id !== cycleId))
        alert("Cycle deleted successfully!")
      } else {
        alert("Failed to delete cycle")
      }
    } catch (error) {
      console.error("Error deleting cycle:", error)
      alert("Error deleting cycle")
    }
  }

  const resetForm = () => {
    setFormData({
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      cycleLength: 28,
      periodLength: 5,
      flow: "medium",
      mood: "normal",
      symptoms: [],
      temperature: "",
      notes: "",
    })
  }

  const openEditDialog = (cycle) => {
    setSelectedCycle(cycle)
    setFormData({
      startDate: cycle.startDate,
      endDate: cycle.endDate || "",
      cycleLength: cycle.cycleLength || 28,
      periodLength: cycle.periodLength || 5,
      flow: cycle.flow || "medium",
      mood: cycle.mood || "normal",
      symptoms: cycle.symptoms || [],
      temperature: cycle.temperature ? cycle.temperature.toString() : "",
      notes: cycle.notes || "",
    })
    setShowEditDialog(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFlowColor = (flow) => {
    switch (flow) {
      case "heavy":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "light":
        return "bg-yellow-100 text-yellow-800"
      case "spotting":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const CycleFormDialog = ({ isEdit = false }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Cycle" : "Add New Cycle"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
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
          <div>
            <Label htmlFor="periodLength">Period Length (days)</Label>
            <Input
              id="periodLength"
              type="number"
              min="3"
              max="7"
              value={formData.periodLength}
              onChange={(e) => setFormData({ ...formData, periodLength: Number.parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="flow">Flow</Label>
            <Select value={formData.flow} onValueChange={(value) => setFormData({ ...formData, flow: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLOW_OPTIONS.map((flow) => (
                  <SelectItem key={flow} value={flow}>
                    {flow.charAt(0).toUpperCase() + flow.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mood">Mood</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((mood) => (
                  <SelectItem key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="98.6"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes about this cycle..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              if (isEdit) {
                setShowEditDialog(false)
                setSelectedCycle(null)
              } else {
                setShowAddDialog(false)
              }
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button onClick={isEdit ? handleEditCycle : handleAddCycle}>{isEdit ? "Update Cycle" : "Add Cycle"}</Button>
        </div>
      </div>
    </DialogContent>
  )

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
              <h1 className="text-xl font-semibold text-gray-800">Cycle Management</h1>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <CycleFormDialog />
            </Dialog>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage your cycle data and predictions</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Cycle Statistics */}
        {cycles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Cycle Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(cycles.reduce((sum, cycle) => sum + (cycle.cycleLength || 28), 0) / cycles.length)}
                  </div>
                  <p className="text-sm text-gray-600">Avg Cycle</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{cycles.length}</div>
                  <p className="text-sm text-gray-600">Tracked</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(cycles.reduce((sum, cycle) => sum + (cycle.periodLength || 5), 0) / cycles.length)}
                  </div>
                  <p className="text-sm text-gray-600">Avg Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cycles List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading cycles...</p>
            </div>
          ) : cycles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cycles recorded yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Start tracking your menstrual cycles to get personalized insights
                </p>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Cycle
                    </Button>
                  </DialogTrigger>
                  <CycleFormDialog />
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            cycles.map((cycle) => (
              <Card key={cycle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-pink-500" />
                      <div>
                        <h3 className="font-medium">
                          {formatDate(cycle.startDate)} - {cycle.endDate ? formatDate(cycle.endDate) : "Ongoing"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cycle: {cycle.cycleLength} days • Period: {cycle.periodLength} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getFlowColor(cycle.flow)}>{cycle.flow}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(cycle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCycle(cycle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Mood: {cycle.mood}</span>
                    {cycle.temperature && <span>Temp: {cycle.temperature}°F</span>}
                  </div>

                  {cycle.notes && <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg mt-2">{cycle.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <CycleFormDialog isEdit={true} />
        </Dialog>
      </div>
    </div>
  )
}
