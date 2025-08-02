"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import AnalyticsChart from "@/components/AnalyticsChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    cycleData: [],
    symptomFrequency: [],
    ageDistribution: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Insights and data visualization</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="growth" className="space-y-6">
          <TabsList>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="cycles">Cycle Data</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Over Time</CardTitle>
                <CardDescription>New user registrations over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={analyticsData.userGrowth}
                  type="line"
                  xKey="date"
                  yKey="users"
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cycles">
            <Card>
              <CardHeader>
                <CardTitle>Cycle Length Distribution</CardTitle>
                <CardDescription>Distribution of menstrual cycle lengths among users</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={analyticsData.cycleData}
                  type="bar"
                  xKey="length"
                  yKey="count"
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms">
            <Card>
              <CardHeader>
                <CardTitle>Most Common Symptoms</CardTitle>
                <CardDescription>Frequency of reported symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={analyticsData.symptomFrequency}
                  type="bar"
                  xKey="symptom"
                  yKey="frequency"
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>User age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={analyticsData.ageDistribution}
                  type="pie"
                  xKey="ageGroup"
                  yKey="count"
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
