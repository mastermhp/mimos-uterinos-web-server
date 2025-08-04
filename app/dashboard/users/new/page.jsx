"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, User, Calendar, Shield, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    status: "active",
    premium: false,
    temporaryPassword: "",
    profile: {
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: "",
      currentCycleDay: 1,
      symptoms: [],
      preferences: {},
    },
  })

  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, temporaryPassword: password }))
  }

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requiresPasswordChange: true, // Force password change on first login
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `User created successfully!\n\nTemporary Password: ${formData.temporaryPassword}\n\nPlease share this password with the user securely.`,
        )
        router.push("/dashboard/users")
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Failed to create user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/dashboard/users">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
                <p className="text-gray-500">Add a new user to the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Enter the user's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Settings</span>
              </CardTitle>
              <CardDescription>Configure account status and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Premium Access</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premium"
                      checked={formData.premium}
                      onCheckedChange={(checked) => handleInputChange("premium", checked)}
                    />
                    <Label htmlFor="premium" className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>Grant premium access</span>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temporaryPassword">Temporary Password *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="temporaryPassword"
                    value={formData.temporaryPassword}
                    onChange={(e) => handleInputChange("temporaryPassword", e.target.value)}
                    placeholder="Enter temporary password"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateTemporaryPassword}>
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-gray-500">User will be required to change this password on first login</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Health Profile</span>
              </CardTitle>
              <CardDescription>Set up initial health tracking parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    min="21"
                    max="35"
                    value={formData.profile.cycleLength}
                    onChange={(e) => handleInputChange("profile.cycleLength", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodLength">Period Length (days)</Label>
                  <Input
                    id="periodLength"
                    type="number"
                    min="3"
                    max="8"
                    value={formData.profile.periodLength}
                    onChange={(e) => handleInputChange("profile.periodLength", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCycleDay">Current Cycle Day</Label>
                  <Input
                    id="currentCycleDay"
                    type="number"
                    min="1"
                    max="35"
                    value={formData.profile.currentCycleDay}
                    onChange={(e) => handleInputChange("profile.currentCycleDay", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastPeriodDate">Last Period Date</Label>
                <Input
                  id="lastPeriodDate"
                  type="date"
                  value={formData.profile.lastPeriodDate}
                  onChange={(e) => handleInputChange("profile.lastPeriodDate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/users">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
