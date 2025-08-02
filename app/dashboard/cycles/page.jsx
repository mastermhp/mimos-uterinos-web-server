"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Eye, Users, TrendingUp, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function CyclesPage() {
  const [cycles, setCycles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState("all") // Updated default value to "all"
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [stats, setStats] = useState({
    totalCycles: 0,
    averageCycleLength: 0,
    averagePeriodLength: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch cycles
      const cyclesResponse = await fetch("/api/cycles")
      const cyclesData = await cyclesResponse.json()

      // Fetch users
      const usersResponse = await fetch("/api/users")
      const usersData = await usersResponse.json()

      if (cyclesData.success) {
        setCycles(cyclesData.data)

        // Calculate stats
        const totalCycles = cyclesData.data.length
        const avgCycleLength =
          totalCycles > 0 ? cyclesData.data.reduce((sum, cycle) => sum + cycle.cycleLength, 0) / totalCycles : 0
        const avgPeriodLength =
          totalCycles > 0 ? cyclesData.data.reduce((sum, cycle) => sum + cycle.periodLength, 0) / totalCycles : 0

        setStats({
          totalCycles,
          averageCycleLength: Math.round(avgCycleLength * 10) / 10,
          averagePeriodLength: Math.round(avgPeriodLength * 10) / 10,
          activeUsers: new Set(cyclesData.data.map((c) => c.userId)).size,
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

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : `User ${userId}`
  }

  const filteredCycles = cycles.filter((cycle) => {
    const userName = getUserName(cycle.userId).toLowerCase()
    const matchesSearch = userName.includes(searchTerm.toLowerCase())
    const matchesUser = selectedUser === "all" || cycle.userId.toString() === selectedUser
    return matchesSearch && matchesUser
  })

  const CycleDetailsDialog = ({ cycle }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Cycle Details - {getUserName(cycle.userId)}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">User:</span>
            <p className="font-medium">{getUserName(cycle.userId)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Start Date:</span>
            <p className="font-medium">{formatDate(cycle.startDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">End Date:</span>
            <p className="font-medium">{cycle.endDate ? formatDate(cycle.endDate) : "Ongoing"}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cycle Length:</span>
            <p className="font-medium">{cycle.cycleLength} days</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Period Length:</span>
            <p className="font-medium">{cycle.periodLength} days</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Flow:</span>
            <Badge className={getFlowColor(cycle.flow)}>
              {cycle.flow.charAt(0).toUpperCase() + cycle.flow.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Mood:</span>
            <Badge variant="outline">{cycle.mood}</Badge>
          </div>
          {cycle.temperature && (
            <div>
              <span className="text-sm text-gray-500">Temperature:</span>
              <p className="font-medium">{cycle.temperature}°F</p>
            </div>
          )}
        </div>

        {cycle.symptoms && cycle.symptoms.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 block mb-2">Symptoms:</span>
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
            <span className="text-sm text-gray-500 block mb-2">Notes:</span>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{cycle.notes}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Link href={`/dashboard/users/${cycle.userId}`}>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              View User Profile
            </Button>
          </Link>
        </div>
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
                <Calendar className="h-8 w-8 text-pink-500" />
                <span>Cycle Management</span>
              </h1>
              <p className="text-gray-500">Monitor and analyze menstrual cycle data</p>
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
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Cycles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCycles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Cycle Length</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCycleLength} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Period Length</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averagePeriodLength} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cycle Data</CardTitle>
            <CardDescription>View and manage all menstrual cycle records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name..."
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
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading cycles...</p>
              </div>
            ) : filteredCycles.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No cycles found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
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
                  {filteredCycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/users/${cycle.userId}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {getUserName(cycle.userId)}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(cycle.startDate)}</TableCell>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCycle(cycle)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedCycle && <CycleDetailsDialog cycle={selectedCycle} />}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
