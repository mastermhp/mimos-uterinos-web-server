"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Clock, Plus, Calendar, Heart, Pill, Droplets, Activity, Bell } from "lucide-react"

export default function RemindersScreen({ onBack }) {
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminders, setReminders] = useState({
    periodStart: true,
    fertileWindow: true,
    medication: false,
    waterIntake: true,
    exercise: false,
  })
  const [customReminders, setCustomReminders] = useState([])

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users/reminders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReminderTime(data.dailyTime || "09:00")
        setReminders(data.types || reminders)
        setCustomReminders(data.custom || [])
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
    }
  }

  const saveReminders = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/users/reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dailyTime: reminderTime,
          types: reminders,
          custom: customReminders,
        }),
      })
    } catch (error) {
      console.error("Error saving reminders:", error)
    }
  }

  const handleReminderToggle = (key, value) => {
    setReminders((prev) => ({ ...prev, [key]: value }))
    saveReminders()
  }

  const reminderTypes = [
    {
      key: "periodStart",
      title: "Period Start Reminder",
      description: "Get notified when your period is about to start",
      icon: Calendar,
      color: "text-pink-600",
    },
    {
      key: "fertileWindow",
      title: "Fertile Window Reminder",
      description: "Get notified during your fertile window",
      icon: Heart,
      color: "text-red-600",
    },
    {
      key: "medication",
      title: "Medication Reminder",
      description: "Get reminded to take your medication",
      icon: Pill,
      color: "text-blue-600",
    },
    {
      key: "waterIntake",
      title: "Water Intake Reminder",
      description: "Get reminded to drink water throughout the day",
      icon: Droplets,
      color: "text-cyan-600",
    },
    {
      key: "exercise",
      title: "Exercise Reminder",
      description: "Get reminded to exercise regularly",
      icon: Activity,
      color: "text-green-600",
    },
  ]

  const addCustomReminder = () => {
    const title = prompt("Enter reminder title:")
    if (title) {
      const newReminder = {
        id: Date.now(),
        title,
        enabled: true,
        time: "09:00",
      }
      setCustomReminders((prev) => [...prev, newReminder])
      saveReminders()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
      </div>

      <div className="space-y-6">
        {/* Daily Reminder Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Daily Reminder Time</p>
                </div>
              </div>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  setReminderTime(e.target.value)
                  saveReminders()
                }}
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Types</h3>
          <div className="space-y-3">
            {reminderTypes.map((reminder) => (
              <Card key={reminder.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <reminder.icon className={`h-5 w-5 ${reminder.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reminder.title}</p>
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminders[reminder.key]}
                      onCheckedChange={(checked) => handleReminderToggle(reminder.key, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Reminders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Custom Reminders</h3>
            <Button onClick={addCustomReminder} size="sm" className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {customReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No custom reminders yet</p>
                <p className="text-sm text-gray-400 mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {customReminders.map((reminder) => (
                <Card key={reminder.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{reminder.title}</p>
                          <p className="text-sm text-gray-600">Custom reminder</p>
                        </div>
                      </div>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={(checked) => {
                          const updated = customReminders.map((r) =>
                            r.id === reminder.id ? { ...r, enabled: checked } : r,
                          )
                          setCustomReminders(updated)
                          saveReminders()
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
