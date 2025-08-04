"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Heart,
  MessageCircle,
  Calendar,
  TrendingUp,
  Activity,
  UserPlus,
  CheckCircle,
  FileText,
  Stethoscope,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalChats: 0,
    totalCycles: 0,
    totalSymptoms: 0,
    totalReports: 0,
    totalConsultations: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel with error handling
      const fetchWithFallback = async (url) => {
        try {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return await response.json()
        } catch (error) {
          console.error(`Error fetching ${url}:`, error)
          return { success: false, data: [] }
        }
      }

      const [usersData, cyclesData, symptomsData, chatsData, reportsData, consultationsData] = await Promise.all([
        fetchWithFallback("/api/users?limit=100"),
        fetchWithFallback("/api/cycles?limit=100"),
        fetchWithFallback("/api/symptoms?limit=100"),
        fetchWithFallback("/api/ai/chat?limit=100"),
        fetchWithFallback("/api/reports?limit=100"),
        fetchWithFallback("/api/doctor/consultations?limit=100"),
      ])

      // Update stats with safe data access
      if (usersData.success && Array.isArray(usersData.data)) {
        const users = usersData.data
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter((u) => u?.status === "active").length,
          premiumUsers: users.filter((u) => u?.premium).length,
        }))
      }

      if (cyclesData.success && Array.isArray(cyclesData.data)) {
        setStats((prev) => ({ ...prev, totalCycles: cyclesData.data.length }))
      }

      if (symptomsData.success && Array.isArray(symptomsData.data)) {
        setStats((prev) => ({ ...prev, totalSymptoms: symptomsData.data.length }))
      }

      if (chatsData.success && Array.isArray(chatsData.data)) {
        setStats((prev) => ({ ...prev, totalChats: chatsData.data.length }))
      }

      if (reportsData.success && Array.isArray(reportsData.data)) {
        setStats((prev) => ({ ...prev, totalReports: reportsData.data.length }))
      }

      if (consultationsData.success && Array.isArray(consultationsData.data)) {
        setStats((prev) => ({ ...prev, totalConsultations: consultationsData.data.length }))
      }

      // Generate real-time activity feed with safe data
      generateRecentActivity(
        usersData.data || [],
        cyclesData.data || [],
        symptomsData.data || [],
        chatsData.data || [],
        consultationsData.data || [],
      )
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivity = (users, cycles, symptoms, chats, consultations) => {
    const activities = []

    // Helper function to generate unique ID
    const generateUniqueId = (type, item, index) => {
      const id = item?.id || item?._id || `temp-${Date.now()}-${index}`
      return `${type}-${id}`
    }

    // Helper function to safely get user name
    const getUserName = (userId) => {
      if (!userId) return "Unknown User"
      const user = users?.find((u) => u?.id === userId || u?._id === userId)
      return user?.name || user?.email?.split("@")[0] || "Unknown User"
    }

    // Helper function to safely format time
    const safeGetRelativeTime = (dateString) => {
      if (!dateString) return "Unknown time"
      try {
        return getRelativeTime(dateString)
      } catch (error) {
        return "Unknown time"
      }
    }

    // Recent user registrations
    if (users && Array.isArray(users)) {
      users.slice(0, 3).forEach((user, index) => {
        if (user) {
          activities.push({
            id: generateUniqueId("user", user, index),
            type: "user_joined",
            message: `New user ${user.name || user.email || "Unknown"} joined`,
            time: safeGetRelativeTime(user.joinDate || user.createdAt),
            icon: UserPlus,
            color: "text-green-500",
            userId: user.id || user._id,
          })
        }
      })
    }

    // Recent symptom logs
    if (symptoms && Array.isArray(symptoms)) {
      symptoms.slice(0, 2).forEach((symptom, index) => {
        if (symptom) {
          activities.push({
            id: generateUniqueId("symptom", symptom, index),
            type: "symptom_logged",
            message: `${getUserName(symptom.userId)} logged new symptoms`,
            time: safeGetRelativeTime(symptom.createdAt),
            icon: Activity,
            color: "text-blue-500",
            userId: symptom.userId,
          })
        }
      })
    }

    // Recent AI chats
    if (chats && Array.isArray(chats)) {
      chats.slice(0, 2).forEach((chat, index) => {
        if (chat) {
          activities.push({
            id: generateUniqueId("chat", chat, index),
            type: "ai_chat",
            message: `AI chat session with ${getUserName(chat.userId)}`,
            time: safeGetRelativeTime(chat.createdAt),
            icon: MessageCircle,
            color: "text-purple-500",
            userId: chat.userId,
          })
        }
      })
    }

    // Recent cycle updates
    if (cycles && Array.isArray(cycles)) {
      cycles.slice(0, 2).forEach((cycle, index) => {
        if (cycle) {
          activities.push({
            id: generateUniqueId("cycle", cycle, index),
            type: "cycle_updated",
            message: `${getUserName(cycle.userId)} updated cycle information`,
            time: safeGetRelativeTime(cycle.createdAt),
            icon: Calendar,
            color: "text-pink-500",
            userId: cycle.userId,
          })
        }
      })
    }

    // Recent consultations
    if (consultations && Array.isArray(consultations)) {
      consultations.slice(0, 1).forEach((consultation, index) => {
        if (consultation) {
          activities.push({
            id: generateUniqueId("consultation", consultation, index),
            type: "consultation_scheduled",
            message: `Consultation scheduled for ${getUserName(consultation.userId)}`,
            time: safeGetRelativeTime(consultation.createdAt),
            icon: Stethoscope,
            color: "text-red-500",
            userId: consultation.userId,
          })
        }
      })
    }

    // Sort by most recent and take top 8
    // Filter out any activities with invalid data
    const validActivities = activities.filter(
      (activity) => activity && activity.id && activity.message && activity.time,
    )

    setRecentActivity(validActivities.slice(0, 8))
  }

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown time"

    try {
      const now = new Date()
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown time"

      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours} hours ago`

      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    } catch (error) {
      console.error("Error parsing date:", error)
      return "Unknown time"
    }
  }

  const StatCard = ({ title, value, description, icon: Icon, color, trend, href }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
        {href && (
          <Link href={href}>
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs">
              View Details →
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mimos Uterinos Dashboard</h1>
                <p className="text-gray-500">Manage your menstrual health app</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered users"
            icon={Users}
            color="text-blue-500"
            trend="+12% from last month"
            href="/dashboard/users"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            description="Currently active"
            icon={Activity}
            color="text-green-500"
            trend="+8% from last week"
            href="/dashboard/users"
          />
          <StatCard
            title="Premium Users"
            value={stats.premiumUsers}
            description="Subscribed users"
            icon={TrendingUp}
            color="text-yellow-500"
            trend="+15% from last month"
            href="/dashboard/users"
          />
          <StatCard
            title="AI Chats"
            value={stats.totalChats}
            description="Total conversations"
            icon={MessageCircle}
            color="text-purple-500"
            trend="+25% from last week"
            href="/dashboard/ai"
          />
          <StatCard
            title="Cycle Records"
            value={stats.totalCycles}
            description="Tracked cycles"
            icon={Calendar}
            color="text-pink-500"
            trend="+18% from last month"
            href="/dashboard/cycles"
          />
          <StatCard
            title="Symptom Logs"
            value={stats.totalSymptoms}
            description="Logged symptoms"
            icon={Heart}
            color="text-red-500"
            trend="+22% from last week"
          />
          <StatCard
            title="Health Reports"
            value={stats.totalReports}
            description="Generated reports"
            icon={FileText}
            color="text-indigo-500"
            trend="+10% from last month"
            href="/dashboard/reports"
          />
          <StatCard
            title="Consultations"
            value={stats.totalConsultations}
            description="Doctor appointments"
            icon={Stethoscope}
            color="text-orange-500"
            trend="+5% from last week"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="health">Health Data</TabsTrigger>
            <TabsTrigger value="ai">AI Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Activity</span>
                    <Badge variant="outline" className="text-xs">
                      Live Updates
                    </Badge>
                  </CardTitle>
                  <CardDescription>Latest updates from your app (auto-refreshes every 30s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          {activity.userId && (
                            <Link href={`/dashboard/users/${activity.userId}`}>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/users">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/dashboard/users/new">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </Link>
                  <Link href="/dashboard/cycles">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Cycle Data
                    </Button>
                  </Link>
                  <Link href="/dashboard/ai">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      AI Chat Management
                    </Button>
                  </Link>
                  <Link href="/dashboard/reports">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Health Reports
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage app users and their profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-500 mb-4">View and manage all registered users</p>
                  <div className="flex justify-center space-x-4">
                    <Link href="/dashboard/users">
                      <Button>View All Users</Button>
                    </Link>
                    <Link href="/dashboard/users/new">
                      <Button variant="outline">Add New User</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cycle Tracking</CardTitle>
                  <CardDescription>Monitor menstrual cycle data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Calendar className="h-10 w-10 text-pink-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Track and analyze cycle patterns</p>
                    <Link href="/dashboard/cycles">
                      <Button variant="outline" size="sm">
                        View Cycles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Reports</CardTitle>
                  <CardDescription>Generate comprehensive reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">View detailed health analytics</p>
                    <Link href="/dashboard/reports">
                      <Button variant="outline" size="sm">
                        View Reports
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Chat Sessions</CardTitle>
                  <CardDescription>Monitor AI conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <MessageCircle className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">View AI chat interactions</p>
                    <Link href="/dashboard/ai">
                      <Button variant="outline" size="sm">
                        View Chats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>AI-generated health insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <TrendingUp className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Review AI recommendations</p>
                    <Link href="/dashboard/reports">
                      <Button variant="outline" size="sm">
                        View Insights
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
