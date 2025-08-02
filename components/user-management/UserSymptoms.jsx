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
import { Checkbox } from "@/components/ui/checkbox"
import { Activity, Plus, Eye, Edit, Trash2, Thermometer } from "lucide-react"

const SYMPTOM_OPTIONS = [
  { id: "cramps", label: "Cramps" },
  { id: "bloating", label: "Bloating" },
  { id: "mood_swings", label: "Mood Swings" },
  { id: "headache", label: "Headache" },
  { id: "fatigue", label: "Fatigue" },
  { id: "nausea", label: "Nausea" },
  { id: "breast_tenderness", label: "Breast Tenderness" },
  { id: "acne", label: "Acne" },
  { id: "food_cravings", label: "Food Cravings" },
  { id: "insomnia", label: "Insomnia" },
]

const MOOD_OPTIONS = ["happy", "normal", "sad", "irritable", "anxious", "energetic"]
const FLOW_OPTIONS = ["none", "spotting", "light", "medium", "heavy"]
const SEVERITY_OPTIONS = ["mild", "moderate", "severe"]

export default function UserSymptoms({ userId }) {
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSymptom, setSelectedSymptom] = useState(null)
  const [newSymptom, setNewSymptom] = useState({
    date: new Date().toISOString().split("T")[0],
    symptoms: [],
    flow: "none",
    mood: "normal",
    temperature: "",
    notes: "",
  })

  useEffect(() => {
    fetchSymptoms()
  }, [userId])

  const fetchSymptoms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/symptoms?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setSymptoms(data.data)
      }
    } catch (error) {
      console.error("Error fetching symptoms:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSymptom = async () => {
    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSymptom,
          userId: Number.parseInt(userId),
          temperature: newSymptom.temperature ? Number.parseFloat(newSymptom.temperature) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSymptoms([data.data, ...symptoms])
        setShowAddDialog(false)
        setNewSymptom({
          date: new Date().toISOString().split("T")[0],
          symptoms: [],
          flow: "none",
          mood: "normal",
          temperature: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error adding symptom:", error)
    }
  }

  const handleSymptomChange = (symptomId, checked) => {
    if (checked) {
      setNewSymptom({
        ...newSymptom,
        symptoms: [...newSymptom.symptoms, { type: symptomId, severity: "mild", notes: "" }],
      })
    } else {
      setNewSymptom({
        ...newSymptom,
        symptoms: newSymptom.symptoms.filter((s) => s.type !== symptomId),
      })
    }
  }

  const updateSymptomSeverity = (symptomId, severity) => {
    setNewSymptom({
      ...newSymptom,
      symptoms: newSymptom.symptoms.map((s) => (s.type === symptomId ? { ...s, severity } : s)),
    })
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 text-red-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "mild":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const SymptomDetailsDialog = ({ symptom }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Symptom Log - {formatDate(symptom.date)}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Flow and Mood */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Flow</Label>
            <Badge className={getFlowColor(symptom.flow)}>
              {symptom.flow.charAt(0).toUpperCase() + symptom.flow.slice(1)}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Mood</Label>
            <Badge variant="outline">{symptom.mood}</Badge>
          </div>
        </div>

        {/* Temperature */}
        {symptom.temperature && (
          <div>
            <Label className="text-sm font-medium text-gray-500">Temperature</Label>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{symptom.temperature}°F</span>
            </div>
          </div>
        )}

        {/* Symptoms */}
        {symptom.symptoms && symptom.symptoms.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Symptoms</Label>
            <div className="space-y-2">
              {symptom.symptoms.map((symptomData, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{symptomData.type.replace("_", " ")}</span>
                  <Badge className={getSeverityColor(symptomData.severity)}>{symptomData.severity}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {symptom.notes && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Notes</Label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{symptom.notes}</p>
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
                <Activity className="h-5 w-5" />
                <span>Symptom Logs</span>
              </CardTitle>
              <CardDescription>Track daily symptoms, flow, mood, and temperature</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Log Symptoms</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log New Symptoms</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSymptom.date}
                      onChange={(e) => setNewSymptom({ ...newSymptom, date: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flow">Flow</Label>
                      <Select
                        value={newSymptom.flow}
                        onValueChange={(value) => setNewSymptom({ ...newSymptom, flow: value })}
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
                        value={newSymptom.mood}
                        onValueChange={(value) => setNewSymptom({ ...newSymptom, mood: value })}
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
                      value={newSymptom.temperature}
                      onChange={(e) => setNewSymptom({ ...newSymptom, temperature: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Symptoms</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {SYMPTOM_OPTIONS.map((symptom) => {
                        const isSelected = newSymptom.symptoms.some((s) => s.type === symptom.id)
                        const selectedSymptom = newSymptom.symptoms.find((s) => s.type === symptom.id)

                        return (
                          <div key={symptom.id} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={symptom.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked)}
                              />
                              <Label htmlFor={symptom.id} className="text-sm font-medium">
                                {symptom.label}
                              </Label>
                            </div>
                            {isSelected && (
                              <Select
                                value={selectedSymptom?.severity || "mild"}
                                onValueChange={(value) => updateSymptomSeverity(symptom.id, value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SEVERITY_OPTIONS.map((severity) => (
                                    <SelectItem key={severity} value={severity}>
                                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about today..."
                      value={newSymptom.notes}
                      onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSymptom}>Log Symptoms</Button>
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
              <p className="text-gray-500 mt-2">Loading symptoms...</p>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No symptoms logged yet</p>
              <p className="text-sm text-gray-400">Start tracking daily symptoms and patterns</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symptoms.map((symptom) => (
                  <TableRow key={symptom.id}>
                    <TableCell className="font-medium">{formatDate(symptom.date)}</TableCell>
                    <TableCell>
                      <Badge className={getFlowColor(symptom.flow)}>
                        {symptom.flow.charAt(0).toUpperCase() + symptom.flow.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{symptom.mood}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {symptom.symptoms && symptom.symptoms.length > 0 ? (
                          symptom.symptoms.slice(0, 2).map((symptomData, index) => (
                            <Badge key={index} className={getSeverityColor(symptomData.severity)} variant="secondary">
                              {symptomData.type.replace("_", " ")}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                        {symptom.symptoms && symptom.symptoms.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{symptom.symptoms.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {symptom.temperature ? (
                        <div className="flex items-center space-x-1">
                          <Thermometer className="h-3 w-3 text-blue-500" />
                          <span className="text-sm">{symptom.temperature}°F</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSymptom(symptom)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedSymptom && <SymptomDetailsDialog symptom={selectedSymptom} />}
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
