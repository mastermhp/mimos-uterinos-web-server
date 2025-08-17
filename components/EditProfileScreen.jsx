"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, User, Mail, Phone, Calendar, Ruler, Weight } from "lucide-react"

export default function EditProfileScreen({ user, onBack, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    height: "",
    weight: "",
    profilePicture: "",
    cycleLength: "",
    periodLength: "",
    lastPeriodDate: "",
    irregularCycles: false,
    contraceptiveUse: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.data || data.user

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || userData.profile?.phone || "",
          birthday: userData.birthday || userData.profile?.birthday || "",
          height: userData.height || userData.profile?.height || "",
          weight: userData.weight || userData.profile?.weight || "",
          profilePicture: userData.profilePicture || userData.profile?.profilePicture || "",
          cycleLength: userData.cycleLength || userData.profile?.cycleLength || "",
          periodLength: userData.periodLength || userData.profile?.periodLength || "",
          lastPeriodDate: userData.lastPeriodDate || userData.profile?.lastPeriodDate || "",
          irregularCycles: userData.irregularCycles || userData.profile?.irregularCycles || false,
          contraceptiveUse: userData.contraceptiveUse || userData.profile?.contraceptiveUse || "",
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const profileResponse = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (formData.cycleLength && formData.lastPeriodDate) {
        const cycleData = {
          userId: user.id || user._id,
          startDate: formData.lastPeriodDate,
          cycleLength: Number.parseInt(formData.cycleLength),
          periodLength: Number.parseInt(formData.periodLength) || 5,
          irregularCycles: formData.irregularCycles,
          contraceptiveUse: formData.contraceptiveUse,
        }

        const cycleResponse = await fetch("/api/cycles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cycleData),
        })

        if (!cycleResponse.ok) {
          console.warn("Failed to update cycle data, but profile was updated")
        }
      }

      if (profileResponse.ok) {
        const updatedUser = { ...user, ...formData }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        onSave?.(formData)
        onBack()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, profilePicture: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="bg-pink-100 text-pink-600 text-2xl">
                {formData.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-pink-600 text-white rounded-full p-2 cursor-pointer hover:bg-pink-700 transition-colors">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-pink-600 font-medium mt-2">Change Profile Picture</p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">
                Birthday
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange("birthday", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                Height (cm)
              </Label>
              <div className="relative mt-1">
                <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your height"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                Weight (kg)
              </Label>
              <div className="relative mt-1">
                <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your weight"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cycle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cycleLength" className="text-sm font-medium text-gray-700">
                Average Cycle Length (days)
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cycleLength"
                  type="number"
                  value={formData.cycleLength}
                  onChange={(e) => handleInputChange("cycleLength", e.target.value)}
                  className="pl-10"
                  placeholder="28"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="periodLength" className="text-sm font-medium text-gray-700">
                Average Period Length (days)
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="periodLength"
                  type="number"
                  value={formData.periodLength}
                  onChange={(e) => handleInputChange("periodLength", e.target.value)}
                  className="pl-10"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lastPeriodDate" className="text-sm font-medium text-gray-700">
                Last Period Start Date
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="lastPeriodDate"
                  type="date"
                  value={formData.lastPeriodDate}
                  onChange={(e) => handleInputChange("lastPeriodDate", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contraceptiveUse" className="text-sm font-medium text-gray-700">
                Contraceptive Use
              </Label>
              <div className="relative mt-1">
                <select
                  id="contraceptiveUse"
                  value={formData.contraceptiveUse}
                  onChange={(e) => handleInputChange("contraceptiveUse", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select contraceptive method</option>
                  <option value="none">None</option>
                  <option value="pill">Birth Control Pill</option>
                  <option value="iud">IUD</option>
                  <option value="implant">Implant</option>
                  <option value="injection">Injection</option>
                  <option value="patch">Patch</option>
                  <option value="ring">Ring</option>
                  <option value="condom">Condom</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="irregularCycles"
                checked={formData.irregularCycles}
                onChange={(e) => handleInputChange("irregularCycles", e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <Label htmlFor="irregularCycles" className="text-sm font-medium text-gray-700">
                I have irregular cycles
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
