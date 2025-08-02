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
import { Stethoscope, Plus, Eye, Edit, Trash2, Calendar, Clock, Video, MapPin } from "lucide-react"

const CONSULTATION_TYPES = ["virtual", "in-person", "phone"]
const CONSULTATION_STATUSES = ["scheduled", "completed", "cancelled", "rescheduled"]

export default function UserConsultations({ userId }) {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [newConsultation, setNewConsultation] = useState({
    doctorName: "",
    type: "virtual",
    scheduledDate: "",
    duration: 30,
    reason: "",
    notes: "",
  })

  useEffect(() => {
    fetchConsultations()
  }, [userId])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/doctor/consultations?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setConsultations(data.data)
      }
    } catch (error) {
      console.error("Error fetching consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddConsultation = async () => {
    try {
      const response = await fetch("/api/doctor/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newConsultation,
          userId: Number.parseInt(userId),
          doctorId: 1, // Mock doctor ID
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConsultations([data.data, ...consultations])
        setShowAddDialog(false)
        setNewConsultation({
          doctorName: "",
          type: "virtual",
          scheduledDate: "",
          duration: 30,
          reason: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error adding consultation:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "virtual":
        return <Video className="h-4 w-4" />
      case "in-person":
        return <MapPin className="h-4 w-4" />
      case "phone":
        return <Clock className="h-4 w-4" />
      default:
        return <Stethoscope className="h-4 w-4" />
    }
  }

  const ConsultationDetailsDialog = ({ consultation }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Consultation Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Doctor</Label>
            <p className="font-medium">{consultation.doctorName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Status</Label>
            <Badge className={getStatusColor(consultation.status)}>
              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Type</Label>
            <div className="flex items-center space-x-2">
              {getTypeIcon(consultation.type)}
              <span className="capitalize">{consultation.type}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Duration</Label>
            <p className="font-medium">{consultation.duration} minutes</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">Scheduled Date & Time</Label>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{formatDate(consultation.scheduledDate)}</span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-2 block">Reason for Consultation</Label>
          <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{consultation.reason}</p>
        </div>

        {/* Notes */}
        {consultation.notes && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Doctor's Notes</Label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{consultation.notes}</p>
          </div>
        )}

        {/* Prescription */}
        {consultation.prescription && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Prescription</Label>
            <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {consultation.prescription}
            </p>
          </div>
        )}

        {/* Follow-up */}
        {consultation.followUp && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">Follow-up Scheduled</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{formatDate(consultation.followUp)}</span>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span>Created: {formatDate(consultation.createdAt)}</span>
            </div>
            {consultation.updatedAt && (
              <div>
                <span>Updated: {formatDate(consultation.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
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
                <Stethoscope className="h-5 w-5" />
                <span>Doctor Consultations</span>
              </CardTitle>
              <CardDescription>Manage user's medical consultations and appointments</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Schedule Consultation</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Consultation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctorName">Doctor Name</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. Sarah Martinez"
                      value={newConsultation.doctorName}
                      onChange={(e) => setNewConsultation({ ...newConsultation, doctorName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Consultation Type</Label>
                      <Select
                        value={newConsultation.type}
                        onValueChange={(value) => setNewConsultation({ ...newConsultation, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONSULTATION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(type)}
                                <span className="capitalize">{type}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={newConsultation.duration.toString()}
                        onValueChange={(value) =>
                          setNewConsultation({ ...newConsultation, duration: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newConsultation.scheduledDate}
                      onChange={(e) => setNewConsultation({ ...newConsultation, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Consultation</Label>
                    <Textarea
                      id="reason"
                      placeholder="Describe the reason for this consultation..."
                      value={newConsultation.reason}
                      onChange={(e) => setNewConsultation({ ...newConsultation, reason: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes or preparation instructions..."
                      value={newConsultation.notes}
                      onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddConsultation}>Schedule Consultation</Button>
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
              <p className="text-gray-500 mt-2">Loading consultations...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No consultations scheduled</p>
              <p className="text-sm text-gray-400">Schedule the first consultation with a healthcare provider</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell className="font-medium">{consultation.doctorName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(consultation.type)}
                        <span className="capitalize">{consultation.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(consultation.scheduledDate)}</TableCell>
                    <TableCell>{consultation.duration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedConsultation(consultation)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedConsultation && <ConsultationDetailsDialog consultation={selectedConsultation} />}
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
