"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import StatsCard from "@/components/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCycles: 0,
    avgCycleLength: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/")
      return
    }

    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to Mimos Uterinos Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value={stats.totalUsers} loading={loading} icon="👥" />
          <StatsCard title="Active Users" value={stats.activeUsers} loading={loading} icon="✅" />
          <StatsCard title="Total Cycles" value={stats.totalCycles} loading={loading} icon="📅" />
          <StatsCard title="Avg Cycle Length" value={`${stats.avgCycleLength} days`} loading={loading} icon="📊" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/users")}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </div>
              </Card>
              <Card
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/users/create")}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">➕</div>
                  <h3 className="font-semibold">Add User</h3>
                  <p className="text-sm text-gray-600">Manually create new user</p>
                </div>
              </Card>
              <Card
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/analytics")}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-600">View detailed analytics</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
