"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Eye, Edit, Trash2, Thermometer } from 'lucide-react'

const FLOW_OPTIONS = ["none", "spotting", "light", "medium", "heavy"]
const MOOD_OPTIONS = ["happy", "normal", "sad", "irritable", "anxious", "energetic"]

export default function UserCycles({ userId }) {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [newCycle, setNewCycle] = useState({
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
  }, [userId])

  const fetchCycles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cycles?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setCycles(data.data)
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
          ...newCycle,
          userId: userId,
          temperature: newCycle.temperature ? Number.parseFloat(newCycle.temperature) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCycles([data.data, ...cycles])
        setShowAddDialog(false)
        setNewCycle({
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
    } catch (error) {
      console.error("Error adding cycle:", error)
    }
  }

  const formatDate = (dateString) => {
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

  const CycleDetailsDialog = ({ cycle }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Cycle Details - {formatDate(cycle.startDate)}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Start Date</Label>
            <p className="font-medium">{formatDate(cycle.startDate)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">End Date</Label>
            <p className="font-medium">{cycle.endDate ? formatDate(cycle.endDate) : "Ongoing"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Cycle Length</Label>
            <p className="font-medium">{cycle.cycleLength} days</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Period Length</Label>
            <p className="font-medium">{cycle.periodLength} days</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Flow</Label>
            <Badge className={getFlowColor(cycle.flow)}>
              {cycle.flow.charAt(0).toUpperCase() + cycle.flow.slice(1)}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Mood</Label>
            <Badge variant="outline">{cycle.mood}</Badge>
          </div>
        </div>

        {cycle.temperature && (
          <div>
            <Label className="text-sm font-medium text-gray-500">Temperature</Label>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{cycle.temperature}°F</span>
            </div>
          </div>
        )}

        {cycle.symptoms && cycle.symptoms.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {cycle.symptoms.map((symptom, index) => (
                <Badge key={index} variant="secondary">
                  {symptom.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cycle.notes && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Notes</Label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{cycle.notes}</p>
          </div>
        )}
      </div>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Menstrual Cycles</span>
              </CardTitle>
              <CardDescription>Track menstrual cycle patterns and flow</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Cycle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Cycle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newCycle.startDate}
                        onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newCycle.endDate}
                        onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
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
                        value={newCycle.cycleLength}
                        onChange={(e) => setNewCycle({ ...newCycle, cycleLength: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodLength">Period Length (days)</Label>
                      <Input
                        id="periodLength"
                        type="number"
                        min="3"
                        max="7"
                        value={newCycle.periodLength}
                        onChange={(e) => setNewCycle({ ...newCycle, periodLength: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flow">Flow</Label>
                      <Select
                        value={newCycle.flow}
                        onValueChange={(value) => setNewCycle({ ...newCycle, flow: value })}
                      >
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
                      <Select
                        value={newCycle.mood}
                        onValueChange={(value) => setNewCycle({ ...newCycle, mood: value })}
                      >
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
                      value={newCycle.temperature}
                      onChange={(e) => setNewCycle({ ...newCycle, temperature: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this cycle..."
                      value={newCycle.notes}
                      onChange={(e) => setNewCycle({ ...newCycle, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCycle}>Add Cycle</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading cycles...</p>
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cycles tracked yet</p>
              <p className="text-sm text-gray-400">Start tracking menstrual cycles</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Cycle Length</TableHead>
                  <TableHead>Period Length</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id || cycle._id || Math.random().toString(36).substr(2, 9)}>
                    <TableCell className="font-medium">{formatDate(cycle.startDate)}</TableCell>
                    <TableCell>{cycle.endDate ? formatDate(cycle.endDate) : "Ongoing"}</TableCell>
                    <TableCell>{cycle.cycleLength} days</TableCell>
                    <TableCell>{cycle.periodLength} days</TableCell>
                    <TableCell>
                      <Badge className={getFlowColor(cycle.flow)}>
                        {cycle.flow.charAt(0).toUpperCase() + cycle.flow.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cycle.mood}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCycle(cycle)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedCycle && <CycleDetailsDialog cycle={selectedCycle} />}
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
