"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Bell, Crown, Moon, Download, HelpCircle, Shield, ChevronRight } from "lucide-react"

export default function SettingsScreen({ onBack, onNavigate }) {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
  })

  const accountItems = [
    {
      id: "profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: User,
      action: () => onNavigate("edit-profile"),
    },
    {
      id: "reminders",
      title: "Reminders",
      subtitle: "Manage your reminders and notifications",
      icon: Bell,
      action: () => onNavigate("reminders"),
    },
    {
      id: "premium",
      title: "Premium",
      subtitle: "Upgrade to premium",
      icon: Crown,
      badge: "NEW",
      action: () => onNavigate("premium"),
    },
  ]

  const preferencesItems = [
    {
      id: "darkMode",
      title: "Dark Mode",
      subtitle: "Switch between light and dark theme",
      icon: Moon,
      hasSwitch: true,
    },
    {
      id: "export",
      title: "Export Data",
      subtitle: "Export your health data",
      icon: Download,
      action: () => handleExportData(),
    },
  ]

  const supportItems = [
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help with using the app",
      icon: HelpCircle,
      action: () => onNavigate("help"),
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      subtitle: "View our privacy policy",
      icon: Shield,
      action: () => onNavigate("privacy"),
    },
  ]

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

  const handleSwitchChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    // Save to backend
    saveSettings({ [key]: value })
  }

  const saveSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      })
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const renderMenuItem = (item) => (
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
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{item.title}</p>
            {item.badge && <Badge className="bg-blue-500 text-white text-xs px-2 py-1">{item.badge}</Badge>}
          </div>
          <p className="text-sm text-gray-600">{item.subtitle}</p>
        </div>
      </div>
      {item.hasSwitch ? (
        <Switch checked={settings[item.id]} onCheckedChange={(checked) => handleSwitchChange(item.id, checked)} />
      ) : (
        <ChevronRight className="h-5 w-5 text-gray-400" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <div>
          <h2 className="text-lg font-medium text-pink-600 mb-3">Account</h2>
          <Card>
            <CardContent className="space-y-1 p-0">{accountItems.map(renderMenuItem)}</CardContent>
          </Card>
        </div>

        {/* Preferences Section */}
        <div>
          <h2 className="text-lg font-medium text-pink-600 mb-3">Preferences</h2>
          <Card>
            <CardContent className="space-y-1 p-0">{preferencesItems.map(renderMenuItem)}</CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="text-lg font-medium text-pink-600 mb-3">Support</h2>
          <Card>
            <CardContent className="space-y-1 p-0">{supportItems.map(renderMenuItem)}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
