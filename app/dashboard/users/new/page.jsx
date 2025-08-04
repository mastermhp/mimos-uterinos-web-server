"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, Heart, Bell, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

const steps = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Health Profile", icon: Heart },
  { id: 3, title: "Preferences", icon: Bell },
  { id: 4, title: "Account Setup", icon: Shield },
]

export default function NewUserPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    status: "active",

    // Health Profile
    height: "",
    weight: "",
    bloodType: "",
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },

    // Preferences
    notificationSettings: {
      periodReminders: true,
      medicationReminders: true,
      appointmentReminders: true,
      healthTips: true,
      emailNotifications: true,
      pushNotifications: true,
    },
    privacySettings: {
      shareDataWithDoctors: true,
      shareAnonymousData: false,
      allowResearchParticipation: false,
    },

    // Account Setup
    password: "",
    confirmPassword: "",
    accountType: "user",
    isActive: true,
    requirePasswordChange: true,
  })

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
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleArrayChange = (field, value) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item)
    setFormData((prev) => ({
      ...prev,
      [field]: items,
    }))
  }

  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      confirmPassword: password,
    }))
  }

  const validateStep = (step) => {
    setError("")

    switch (step) {
      case 1:
        if (!formData.name) {
          setError("Name is required")
          return false
        }
        if (!formData.email) {
          setError("Email is required")
          return false
        }
        if (!formData.email.includes("@")) {
          setError("Please enter a valid email address")
          return false
        }
        return true
      case 2:
        // Health profile is optional
        return true
      case 3:
        // Preferences are optional
        return true
      case 4:
        if (!formData.password) {
          setError("Password is required")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    } else {
      toast.error(error || "Please fill in all required fields")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error(error || "Please complete all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Prepare the data for submission
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        dateOfBirth: formData.dateOfBirth || "",
        status: formData.status || "active",
        accountType: formData.accountType,
        isActive: formData.isActive,
        password: formData.password,
        requirePasswordChange: formData.requirePasswordChange,
        profile: {
          height: formData.height || "",
          weight: formData.weight || "",
          bloodType: formData.bloodType || "",
          allergies: formData.allergies || [],
          medications: formData.medications || [],
          medicalConditions: formData.medicalConditions || [],
          emergencyContact: formData.emergencyContact || {
            name: "",
            phone: "",
            relationship: "",
          },
        },
        preferences: {
          notificationSettings: formData.notificationSettings,
          privacySettings: formData.privacySettings,
        },
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user")
      }

      if (result.success) {
        toast.success("User created successfully!")
        router.push("/dashboard/users")
      } else {
        toast.error(result.message || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error.message || "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Enter height"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Enter weight"
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="allergies">Allergies (comma-separated)</Label>
              <Input
                id="allergies"
                value={formData.allergies.join(", ")}
                onChange={(e) => handleArrayChange("allergies", e.target.value)}
                placeholder="e.g., Peanuts, Shellfish, Penicillin"
              />
            </div>

            <div>
              <Label htmlFor="medications">Current Medications (comma-separated)</Label>
              <Input
                id="medications"
                value={formData.medications.join(", ")}
                onChange={(e) => handleArrayChange("medications", e.target.value)}
                placeholder="e.g., Aspirin, Birth Control"
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
              <Input
                id="medicalConditions"
                value={formData.medicalConditions.join(", ")}
                onChange={(e) => handleArrayChange("medicalConditions", e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange("emergencyContact.name", e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange("emergencyContact.phone", e.target.value)}
                    placeholder="Contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange("emergencyContact.relationship", e.target.value)}
                    placeholder="e.g., Mother, Sister"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                {Object.entries(formData.notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleInputChange(`notificationSettings.${key}`, checked)}
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Privacy Settings</h4>
              <div className="space-y-3">
                {Object.entries(formData.privacySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleInputChange(`privacySettings.${key}`, checked)}
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Regular User</SelectItem>
                  <SelectItem value="premium">Premium User</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Temporary Password *</Label>
                <Button type="button" variant="outline" size="sm" onClick={generateTemporaryPassword}>
                  Generate Password
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter temporary password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requirePasswordChange"
                checked={formData.requirePasswordChange}
                onCheckedChange={(checked) => handleInputChange("requirePasswordChange", checked)}
              />
              <Label htmlFor="requirePasswordChange" className="text-sm">
                Require password change on first login
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive" className="text-sm">
                Account is active
              </Label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The user will receive an email with their temporary password and will be required
                to change it on their first login.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-muted-foreground">
          Set up a comprehensive user profile with health information and preferences
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }
                `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                  >
                    Step {step.id}
                  </p>
                  <p
                    className={`text-xs ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="w-full" />
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter the user's basic personal information"}
            {currentStep === 2 && "Set up health profile and emergency contacts"}
            {currentStep === 3 && "Configure notification and privacy preferences"}
            {currentStep === 4 && "Create account credentials and settings"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating User..." : "Create User"}
          </Button>
        )}
      </div>
    </div>
  )
}
