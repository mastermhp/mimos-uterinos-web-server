"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Search, Filter, Eye, Edit, Trash2, Crown, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users?page=${currentPage}&limit=10&search=${searchTerm}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not available"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusColor = (status) => {
    const safeStatus = status || "unknown"
    switch (safeStatus) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDisplay = (status) => {
    const safeStatus = status || "unknown"
    return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)
  }

  const UserDetailsDialog = ({ user }) => {
    if (!user) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`} />
              <AvatarFallback>
                {(user.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name || "Unknown User"}</h3>
              <p className="text-sm text-gray-500">{user.email || "No email"}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge className={getStatusColor(user.status)}>{getStatusDisplay(user.status)}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Premium</label>
              <div className="flex items-center space-x-2">
                {user.premium ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline">Free</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.email || "Not provided"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Born: {formatDate(user.dateOfBirth)}</span>
              </div>
            </div>
          </div>

          {/* Health Profile */}
          {user.profile && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Health Profile</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Cycle Length:</span>
                  <span className="ml-2 font-medium">{user.profile.cycleLength || 28} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Period Length:</span>
                  <span className="ml-2 font-medium">{user.profile.periodLength || 5} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Period:</span>
                  <span className="ml-2 font-medium">{formatDate(user.profile.lastPeriodDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current Day:</span>
                  <span className="ml-2 font-medium">Day {user.profile.currentCycleDay || 1}</span>
                </div>
              </div>

              {user.profile.symptoms && user.profile.symptoms.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Recent Symptoms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.profile.symptoms.map((symptom, index) => (
                      <Badge key={`symptom-${index}`} variant="outline" className="text-xs">
                        {symptom.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Activity</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Joined:</span>
                <span className="ml-2 font-medium">{formatDate(user.joinDate || user.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Active:</span>
                <span className="ml-2 font-medium">{formatDate(user.lastActive || user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500">Manage app users and their profiles</p>
              </div>
            </div>
            <Link href="/dashboard/users/new">
              <Button className="bg-blue-600 hover:bg-blue-700">Add New User</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>Manage and monitor all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id || user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`}
                              />
                              <AvatarFallback>
                                {(user.name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || "Unknown User"}</p>
                              <p className="text-sm text-gray-500">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>{getStatusDisplay(user.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.premium ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.joinDate || user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.lastActive || user.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {selectedUser && <UserDetailsDialog user={selectedUser} />}
                            </Dialog>
                            <Link href={`/dashboard/users/${user._id || user.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
