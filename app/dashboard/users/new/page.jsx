"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, Heart, Settings, FileCheck, Crown } from "lucide-react"
import Link from "next/link"

const SYMPTOM_OPTIONS = [
  "cramps",
  "bloating",
  "mood_swings",
  "headache",
  "fatigue",
  "nausea",
  "breast_tenderness",
  "acne",
  "food_cravings",
  "insomnia",
]

const MEDICAL_CONDITIONS = [
  "PCOS",
  "Endometriosis",
  "Fibroids",
  "Thyroid Issues",
  "Diabetes",
  "Anemia",
  "Depression",
  "Anxiety",
]

export default function NewUserPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    location: "",

    // Step 2: Health Profile
    cycleLength: 28,
    periodLength: 5,
    lastPeriodDate: "",
    commonSymptoms: [],
    medicalConditions: [],
    medications: "",

    // Step 3: Account Settings
    premium: false,
    emailNotifications: true,
    pushNotifications: true,
    reminderNotifications: true,

    // Step 4: Additional Notes
    notes: "",
    doctorName: "",
    emergencyContact: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSymptomToggle = (symptom) => {
    setFormData((prev) => ({
      ...prev,
      commonSymptoms: prev.commonSymptoms.includes(symptom)
        ? prev.commonSymptoms.filter((s) => s !== symptom)
        : [...prev.commonSymptoms, symptom],
    }))
  }

  const handleConditionToggle = (condition) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter((c) => c !== condition)
        : [...prev.medicalConditions, condition],
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const userData = {
        ...formData,
        status: "active",
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        profile: {
          cycleLength: formData.cycleLength,
          periodLength: formData.periodLength,
          lastPeriodDate: formData.lastPeriodDate,
          currentCycleDay: formData.lastPeriodDate
            ? Math.floor((new Date() - new Date(formData.lastPeriodDate)) / (1000 * 60 * 60 * 24)) + 1
            : 1,
          symptoms: formData.commonSymptoms,
          medicalConditions: formData.medicalConditions,
          medications: formData.medications
            .split(",")
            .map((m) => m.trim())
            .filter((m) => m),
        },
        settings: {
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          reminderNotifications: formData.reminderNotifications,
        },
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/users/${data.data.id}`)
      } else {
        console.error("Error creating user:", data.message)
      }
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 1:
        return <User className="h-5 w-5" />
      case 2:
        return <Heart className="h-5 w-5" />
      case 3:
        return <Settings className="h-5 w-5" />
      case 4:
        return <FileCheck className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
                <p className="text-gray-500">Add a new user to the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step <= currentStep ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  {getStepIcon(step)}
                </div>
                {step < 4 && <div className={`w-24 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">Step {currentStep} of 4</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <span>
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Health Profile"}
                {currentStep === 3 && "Account Settings"}
                {currentStep === 4 && "Review & Notes"}
              </span>
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter the user's basic personal information"}
              {currentStep === 2 && "Set up the user's health profile and medical history"}
              {currentStep === 3 && "Configure account settings and preferences"}
              {currentStep === 4 && "Review information and add additional notes"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Sarah Johnson"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sarah@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="New York, NY"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Health Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                    <Input
                      id="cycleLength"
                      type="number"
                      min="21"
                      max="35"
                      value={formData.cycleLength}
                      onChange={(e) => handleInputChange("cycleLength", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodLength">Period Length (days)</Label>
                    <Input
                      id="periodLength"
                      type="number"
                      min="3"
                      max="7"
                      value={formData.periodLength}
                      onChange={(e) => handleInputChange("periodLength", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastPeriodDate">Last Period Date</Label>
                    <Input
                      id="lastPeriodDate"
                      type="date"
                      value={formData.lastPeriodDate}
                      onChange={(e) => handleInputChange("lastPeriodDate", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Common Symptoms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SYMPTOM_OPTIONS.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={formData.commonSymptoms.includes(symptom)}
                          onCheckedChange={() => handleSymptomToggle(symptom)}
                        />
                        <Label htmlFor={symptom} className="text-sm">
                          {symptom.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Medical Conditions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MEDICAL_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={formData.medicalConditions.includes(condition)}
                          onCheckedChange={() => handleConditionToggle(condition)}
                        />
                        <Label htmlFor={condition} className="text-sm">
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="List current medications, separated by commas"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Account Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Account Type</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="premium"
                        checked={formData.premium}
                        onCheckedChange={(checked) => handleInputChange("premium", checked)}
                      />
                      <Label htmlFor="premium" className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span>Premium Account</span>
                      </Label>
                    </div>
                  </div>
                  {formData.premium && (
                    <p className="text-sm text-gray-500 mt-2">
                      Premium users get access to advanced features, detailed reports, and priority support.
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Notification Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                      />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pushNotifications"
                        checked={formData.pushNotifications}
                        onCheckedChange={(checked) => handleInputChange("pushNotifications", checked)}
                      />
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminderNotifications"
                        checked={formData.reminderNotifications}
                        onCheckedChange={(checked) => handleInputChange("reminderNotifications", checked)}
                      />
                      <Label htmlFor="reminderNotifications">Period & Ovulation Reminders</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Notes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cycle Length:</span>
                        <span className="ml-2 font-medium">{formData.cycleLength} days</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Account Type:</span>
                        <span className="ml-2">
                          {formData.premium ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </span>
                      </div>
                    </div>

                    {formData.commonSymptoms.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm">Common Symptoms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.commonSymptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {symptom.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName">Primary Doctor (Optional)</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. Sarah Martinez"
                      value={formData.doctorName}
                      onChange={(e) => handleInputChange("doctorName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Contact name and phone"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this user..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating User..." : "Create User"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
