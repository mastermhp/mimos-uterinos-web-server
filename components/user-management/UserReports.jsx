"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Eye, Download, Trash2, Calendar, TrendingUp, BarChart3 } from "lucide-react"

const REPORT_TYPES = [
  { value: "monthly", label: "Monthly Summary" },
  { value: "quarterly", label: "Quarterly Analysis" },
  { value: "yearly", label: "Yearly Overview" },
  { value: "doctor", label: "Medical Summary" },
  { value: "custom", label: "Custom Report" },
]

export default function UserReports({ userId }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [newReport, setNewReport] = useState({
    type: "monthly",
    title: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchReports()
  }, [userId])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newReport,
          userId: Number.parseInt(userId),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReports([data.data, ...reports])
        setShowAddDialog(false)
        setNewReport({
          type: "monthly",
          title: "",
          startDate: "",
          endDate: "",
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReportTypeColor = (type) => {
    switch (type) {
      case "monthly":
        return "bg-blue-100 text-blue-800"
      case "quarterly":
        return "bg-green-100 text-green-800"
      case "yearly":
        return "bg-purple-100 text-purple-800"
      case "doctor":
        return "bg-red-100 text-red-800"
      case "custom":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const ReportDetailsDialog = ({ report }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{report.title}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Report Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Report Type</Label>
            <Badge className={getReportTypeColor(report.type)}>
              {REPORT_TYPES.find((t) => t.value === report.type)?.label || report.type}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Date Range</Label>
            <p className="text-sm font-medium">
              {report.dateRange && report.dateRange.start && report.dateRange.end
                ? `${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`
                : "Date range not available"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Generated</Label>
            <p className="text-sm font-medium">{formatDate(report.createdAt)}</p>
          </div>
        </div>

        {/* Key Metrics */}
        {report.data && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Key Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.data.cyclesTracked !== undefined && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Cycles Tracked</p>
                        <p className="text-2xl font-bold text-gray-900">{report.data.cyclesTracked}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.data.averageCycleLength && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Avg Cycle Length</p>
                        <p className="text-2xl font-bold text-gray-900">{report.data.averageCycleLength} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.data.averagePeriodLength && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Avg Period Length</p>
                        <p className="text-2xl font-bold text-gray-900">{report.data.averagePeriodLength} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.data.consultations !== undefined && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Consultations</p>
                        <p className="text-2xl font-bold text-gray-900">{report.data.consultations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Common Symptoms */}
        {report.data?.commonSymptoms && report.data.commonSymptoms.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Most Common Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {report.data.commonSymptoms.map((symptom, index) => (
                <Badge key={index} variant="secondary">
                  {symptom.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mood Trends */}
        {report.data?.moodTrends && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Mood Trends</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.data.moodTrends).map(([mood, count]) => (
                <div key={mood} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{mood}</p>
                  <p className="text-xl font-bold text-gray-900">{count} days</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flow Patterns */}
        {report.data?.flowPatterns && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Flow Patterns</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(report.data.flowPatterns).map(([flow, count]) => (
                <div key={flow} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{flow}</p>
                  <p className="text-xl font-bold text-gray-900">{count} days</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {report.insights && report.insights.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI Insights</h4>
            <div className="space-y-2">
              {report.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {report.data?.medications && report.data.medications.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Current Medications</h4>
            <div className="flex flex-wrap gap-2">
              {report.data.medications.map((medication, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {medication.replace("_", " ")}
                </Badge>
              ))}
            </div>
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
                <FileText className="h-5 w-5" />
                <span>Health Reports</span>
              </CardTitle>
              <CardDescription>Generate and view comprehensive health reports for this user</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate New Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Report Type</Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., January 2024 Health Summary"
                      value={newReport.title}
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newReport.startDate}
                        onChange={(e) => setNewReport({ ...newReport, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newReport.endDate}
                        onChange={(e) => setNewReport({ ...newReport, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
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
              <p className="text-gray-500 mt-2">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports generated yet</p>
              <p className="text-sm text-gray-400">Generate the first health report to track progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          <Badge className={getReportTypeColor(report.type)}>
                            {REPORT_TYPES.find((t) => t.value === report.type)?.label || report.type}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>
                            {report.dateRange && report.dateRange.start && report.dateRange.end
                              ? `${formatDate(report.dateRange.start)} - ${formatDate(report.dateRange.end)}`
                              : "Date range not available"}
                          </span>
                          <span>•</span>
                          <span>Generated {formatDate(report.createdAt)}</span>
                        </div>

                        {/* Quick Stats */}
                        {report.data && (
                          <div className="flex items-center space-x-6 text-sm">
                            {report.data.cyclesTracked !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>{report.data.cyclesTracked} cycles</span>
                              </div>
                            )}
                            {report.data.commonSymptoms && (
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span>{report.data.commonSymptoms.length} symptoms tracked</span>
                              </div>
                            )}
                            {report.insights && (
                              <div className="flex items-center space-x-1">
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                                <span>{report.insights.length} insights</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedReport && <ReportDetailsDialog report={selectedReport} />}
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
