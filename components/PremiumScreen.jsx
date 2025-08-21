"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Check, X } from "lucide-react"

export default function PremiumScreen({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState("yearly")
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$4.99/month",
      description: "Perfect for trying premium features",
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$39.99/year",
      badge: "Save 33%",
      description: "Most popular choice",
      highlight: true,
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$99.99",
      badge: "Best Value",
      description: "One-time payment, lifetime access",
    },
  ]

  const features = [
    {
      name: "Ad-Free Experience",
      description: "Enjoy the app without any advertisements",
      free: false,
      premium: true,
    },
    {
      name: "Advanced Analytics",
      description: "Get detailed insights about your cycle",
      free: false,
      premium: true,
    },
    {
      name: "Unlimited Notes",
      description: "Add as many notes as you want",
      free: false,
      premium: true,
    },
    {
      name: "Health Reports",
      description: "Generate comprehensive health reports",
      free: false,
      premium: true,
    },
    {
      name: "AI Predictions",
      description: "Enhanced AI-powered cycle predictions",
      free: false,
      premium: true,
    },
    {
      name: "Export Data",
      description: "Export your health data anytime",
      free: true,
      premium: true,
    },
  ]

  const handleSubscribe = async (planId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Handle subscription success
        console.log("Subscription created:", data)
      }
    } catch (error) {
      console.error("Error creating subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Upgrade to Premium</h1>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Premium Features</h2>
          <p className="text-gray-600">Get the most out of your cycle tracking experience with premium features.</p>
        </div>

        {/* Pricing Plans */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id ? "ring-2 ring-pink-500 bg-pink-50" : "hover:shadow-md"
                } ${plan.highlight ? "border-pink-500" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge className={plan.highlight ? "bg-pink-500" : "bg-yellow-500"}>{plan.badge}</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Premium Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{feature.name}</p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="ml-4">
                  {feature.premium ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subscribe Button */}
        <Button
          onClick={() => handleSubscribe(selectedPlan)}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3"
        >
          {loading ? "Processing..." : `Subscribe to ${plans.find((p) => p.id === selectedPlan)?.name} Plan`}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel anytime from your account
          settings.
        </p>
      </div>
    </div>
  )
}
