"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, User, Bell, Download, ChevronRight, Calendar, Activity, Droplets, LogOut } from "lucide-react"

export default function ProfileScreen({ user, onNavigate }) {
  const [userStats, setUserStats] = useState({
    cyclesTracked: 0,
    avgCycleLength: 28,
    avgPeriodLength: 5,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Fetching user stats...") // Added debug logging
      const response = await fetch("/api/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Stats response:", data) // Added debug logging
        setUserStats(data.stats)
      } else {
        console.error("[v0] Stats fetch failed:", response.status)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mimos-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const menuItems = [
    {
      id: "settings",
      title: "Settings",
      subtitle: "Customize app preferences",
      icon: Settings,
      action: () => onNavigate("settings"),
    },
    {
      id: "doctor",
      title: "Doctor Mode",
      subtitle: "View medical reports",
      icon: User,
      action: () => onNavigate("doctor"),
    },
    {
      id: "reminders",
      title: "Reminders",
      subtitle: "Set up notifications",
      icon: Bell,
      action: () => onNavigate("reminders"),
    },
    {
      id: "export",
      title: "Export Data",
      subtitle: "Download your data",
      icon: Download,
      action: () => handleExportData(),
    },
    {
      id: "logout",
      title: "Log Out",
      subtitle: "Sign out of your account",
      icon: LogOut,
      action: handleLogout,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
            <AvatarFallback className="bg-pink-100 text-pink-600 text-xl">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
            <Badge variant="secondary" className="bg-pink-100 text-pink-600">
              {user?.subscriptionPlan || "Free Plan"}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onNavigate("settings")}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">My Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="h-6 w-6 text-pink-600" />
              </div>
              <p className="text-sm text-gray-600">Cycles Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.cyclesTracked}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Avg. Cycle Length</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.avgCycleLength} days</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">Avg. Period Length</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.avgPeriodLength} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
