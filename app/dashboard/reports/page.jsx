"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Eye, Download, Users, TrendingUp, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"

const REPORT_TYPES = [
  { value: "monthly", label: "Monthly Summary" },
  { value: "quarterly", label: "Quarterly Analysis" },
  { value: "yearly", label: "Yearly Overview" },
  { value: "doctor", label: "Medical Summary" },
  { value: "custom", label: "Custom Report" },
]

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState("all") // Updated default value
  const [selectedType, setSelectedType] = useState("all") // Updated default value
  const [selectedReport, setSelectedReport] = useState(null)
  const [stats, setStats] = useState({
    totalReports: 0,
    monthlyReports: 0,
    doctorReports: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch reports
      const reportsResponse = await fetch("/api/reports")
      const reportsData = await reportsResponse.json()

      // Fetch users
      const usersResponse = await fetch("/api/users")
      const usersData = await usersResponse.json()

      if (reportsData.success) {
        setReports(reportsData.data)

        // Calculate stats
        const totalReports = reportsData.data.length
        const monthlyReports = reportsData.data.filter((r) => r.type === "monthly").length
        const doctorReports = reportsData.data.filter((r) => r.type === "doctor").length
        const activeUsers = new Set(reportsData.data.map((r) => r.userId)).size

        setStats({
          totalReports,
          monthlyReports,
          doctorReports,
          activeUsers,
        })
      }

      if (usersData.success) {
        setUsers(usersData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : `User ${userId}`
  }

  const filteredReports = reports.filter((report) => {
    const userName = getUserName(report.userId).toLowerCase()
    const matchesSearch =
      userName.includes(searchTerm.toLowerCase()) || report.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUser = selectedUser === "all" || report.userId.toString() === selectedUser
    const matchesType = selectedType === "all" || report.type === selectedType
    return matchesSearch && matchesUser && matchesType
  })

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
            <span className="text-sm text-gray-500">User:</span>
            <Link
              href={`/dashboard/users/${report.userId}`}
              className="block font-medium text-blue-600 hover:text-blue-800"
            >
              {getUserName(report.userId)}
            </Link>
          </div>
          <div>
            <span className="text-sm text-gray-500">Report Type:</span>
            <Badge className={getReportTypeColor(report.type)}>
              {REPORT_TYPES.find((t) => t.value === report.type)?.label || report.type}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-gray-500">Generated:</span>
            <p className="font-medium">{formatDate(report.createdAt)}</p>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-500">Date Range:</span>
          <p className="font-medium">
            {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
          </p>
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

        {/* AI Insights */}
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
      </div>
    </DialogContent>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="h-8 w-8 text-green-500" />
                <span>Reports Management</span>
              </h1>
              <p className="text-gray-500">View and manage health reports and analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthlyReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Doctor Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.doctorReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Health Reports</CardTitle>
            <CardDescription>View and manage all generated health reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name or report title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
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
                            <Link
                              href={`/dashboard/users/${report.userId}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {getUserName(report.userId)}
                            </Link>
                            <span>•</span>
                            <span>
                              {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
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
    </div>
  )
}
