"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Clock, Crown } from "lucide-react"
import UserCycles from "@/components/user-management/UserCycles"
import UserSymptoms from "@/components/user-management/UserSymptoms"
import UserChats from "@/components/user-management/UserChats"
import UserConsultations from "@/components/user-management/UserConsultations"
import UserReports from "@/components/user-management/UserReports"

export default function UserDetailPage({ params }) {
  const router = useRouter()
  const { id } = use(params)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setUser(data.data)
        } else {
          throw new Error(data.message || "Failed to fetch user")
        }
      } catch (err) {
        console.error("Error fetching user:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  // Helper function to safely format status
  const formatStatus = (status) => {
    if (!status) return "Unknown"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Helper function to safely get user initials
  const getUserInitials = (name) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (err) {
      return "Invalid date"
    }
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-500"

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500 hover:bg-green-600"
      case "inactive":
        return "bg-gray-500 hover:bg-gray-600"
      case "suspended":
        return "bg-red-500 hover:bg-red-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>

        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load user</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">User Not Found</h1>
        </div>

        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">The requested user could not be found</h2>
              <p className="text-gray-600 mb-4">
                The user may have been deleted or you may not have permission to view it.
              </p>
              <Button onClick={() => router.push("/dashboard/users")}>Return to Users</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(user.status)}>{formatStatus(user.status || "Unknown")}</Badge>
          <Button variant="outline">Edit User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white">{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name || "No Name"}</h3>
                <p className="text-sm text-gray-500">
                  {user.accountType ? (
                    <>
                      {user.accountType === "premium" && (
                        <span className="flex items-center">
                          <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                          Premium User
                        </span>
                      )}
                      {user.accountType === "user" && "Regular User"}
                      {user.accountType === "doctor" && "Doctor"}
                    </>
                  ) : (
                    "User"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{user.email || "No email"}</span>
              </div>

              {user.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.dateOfBirth && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Born {formatDate(user.dateOfBirth)}</span>
                </div>
              )}

              {user.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{user.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>

              {user.lastLogin && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Last active {formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>

            {user.requirePasswordChange && (
              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                User needs to change password on next login
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Data Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="cycles">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="cycles">Cycles</TabsTrigger>
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="chats">AI Chats</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="cycles">
              <Card>
                <CardHeader>
                  <CardTitle>Cycle History</CardTitle>
                  <CardDescription>View and manage user's menstrual cycle data</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserCycles userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="symptoms">
              <Card>
                <CardHeader>
                  <CardTitle>Symptom Tracking</CardTitle>
                  <CardDescription>View user's tracked symptoms and health data</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserSymptoms userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats">
              <Card>
                <CardHeader>
                  <CardTitle>AI Chat History</CardTitle>
                  <CardDescription>View user's conversations with the AI assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserChats userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Consultations</CardTitle>
                  <CardDescription>View user's doctor consultation history</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserConsultations userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Health Reports</CardTitle>
                  <CardDescription>View user's generated health reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserReports userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
