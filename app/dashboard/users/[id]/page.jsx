"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Calendar,
  MessageSquare,
  FileText,
  Stethoscope,
  Activity,
  ArrowLeft,
  Crown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import UserCycles from "@/components/user-management/UserCycles"
import UserSymptoms from "@/components/user-management/UserSymptoms"
import UserChats from "@/components/user-management/UserChats"
import UserConsultations from "@/components/user-management/UserConsultations"
import UserReports from "@/components/user-management/UserReports"

export default function UserDetailPage() {
  const params = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.data)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not available"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"

    switch (status.toLowerCase()) {
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

  const formatStatus = (status) => {
    if (!status) return "Unknown"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getUserInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-4">The user you're looking for doesn't exist.</p>
          <Link href="/dashboard/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`} />
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <span>{user.name || "Unknown User"}</span>
                  {user.premium && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-500">{user.email || "No email provided"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(user.status)}>{formatStatus(user.status)}</Badge>
              <Button variant="outline">Edit User</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="cycles" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Cycles</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI Chats</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Consultations</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.phone || "Not provided"}</span>
                  </div>
                  {user.dateOfBirth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Born: {formatDate(user.dateOfBirth)}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Profile */}
              {user.profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Health Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {user.profile.cycleLength && (
                        <div>
                          <span className="text-gray-500">Cycle Length:</span>
                          <span className="ml-2 font-medium">{user.profile.cycleLength} days</span>
                        </div>
                      )}
                      {user.profile.periodLength && (
                        <div>
                          <span className="text-gray-500">Period Length:</span>
                          <span className="ml-2 font-medium">{user.profile.periodLength} days</span>
                        </div>
                      )}
                      {user.profile.lastPeriodDate && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Last Period:</span>
                          <span className="ml-2 font-medium">{formatDate(user.profile.lastPeriodDate)}</span>
                        </div>
                      )}
                      {user.profile.currentCycleDay && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Current Day:</span>
                          <span className="ml-2 font-medium">Day {user.profile.currentCycleDay}</span>
                        </div>
                      )}
                    </div>

                    {user.profile.symptoms && user.profile.symptoms.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm">Common Symptoms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.profile.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Account Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Account Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Joined:</span>
                    <span className="ml-2 font-medium text-sm">{formatDate(user.joinDate || user.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Last Active:</span>
                    <span className="ml-2 font-medium text-sm">{formatDate(user.lastActive || user.updatedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Account Type:</span>
                    <span className="ml-2">
                      {user.premium ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Cycles Tracked</p>
                      <p className="text-2xl font-bold text-gray-900">{user.stats?.cyclesTracked || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Symptoms Logged</p>
                      <p className="text-2xl font-bold text-gray-900">{user.stats?.symptomsLogged || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">AI Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{user.stats?.aiConversations || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Stethoscope className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Consultations</p>
                      <p className="text-2xl font-bold text-gray-900">{user.stats?.consultations || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cycles">
            <UserCycles userId={params.id} />
          </TabsContent>

          <TabsContent value="symptoms">
            <UserSymptoms userId={params.id} />
          </TabsContent>

          <TabsContent value="chats">
            <UserChats userId={params.id} />
          </TabsContent>

          <TabsContent value="consultations">
            <UserConsultations userId={params.id} />
          </TabsContent>

          <TabsContent value="reports">
            <UserReports userId={params.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
