"use client"

import { useState, useRef, useEffect } from "react"

export default function AIChatScreen({ user, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: `Hello ${user.name}! I'm your Mimos Uterinos AI health coach. I'm here to provide personalized insights based on your cycle data. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/ai/chat?userId=${user.id || user._id}`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setChatHistory(data.data)
        // Load the most recent chat messages
        const latestChat = data.data[0]
        if (latestChat.messages && latestChat.messages.length > 0) {
          const formattedMessages = latestChat.messages.map((msg, index) => ({
            id: msg.id || index + 1,
            type: msg.role === "user" ? "user" : "ai",
            content: msg.content,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
          setMessages([...messages, ...formattedMessages])
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const isHealthRelated = (message) => {
    const healthKeywords = [
      "period",
      "menstrual",
      "cycle",
      "ovulation",
      "cramps",
      "pms",
      "symptoms",
      "bleeding",
      "fertility",
      "hormone",
      "pain",
      "mood",
      "energy",
      "health",
      "pregnancy",
      "contraception",
      "birth control",
      "irregular",
      "heavy",
      "light",
      "spotting",
      "discharge",
      "bloating",
      "headache",
      "nausea",
      "breast",
      "tender",
      "acne",
      "weight",
      "exercise",
      "diet",
      "nutrition",
      "stress",
      "sleep",
      "fatigue",
      "doctor",
      "gynecologist",
      "medical",
    ]

    const lowerMessage = message.toLowerCase()
    return healthKeywords.some((keyword) => lowerMessage.includes(keyword))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Check if message is health-related
      if (!isHealthRelated(inputMessage)) {
        const restrictedMessage = {
          id: Date.now() + 1,
          type: "ai",
          content:
            "I'm specialized in menstrual health and women's wellness topics. I can help you with questions about your cycle, symptoms, period tracking, fertility, and general reproductive health. What would you like to know about your menstrual health?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, restrictedMessage])
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          message: inputMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          data.data?.messages?.[1]?.content ||
          "I'm here to help with your menstrual health questions. Could you please rephrase your question?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, aiMessage])

      setTimeout(() => {
        loadChatHistory()
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "I'm having trouble responding right now. Please try asking about your cycle, symptoms, or any menstrual health concerns.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Mimos Uterinos AI Coach</h1>
            </div>
            {chatHistory.length > 0 && (
              <div className="text-xs text-gray-500">
                {chatHistory.length} conversation{chatHistory.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-6 py-6 space-y-4">
          {loadingHistory && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading chat history...</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">AI Coach</span>
                  </div>
                )}
                <p className={`text-sm leading-relaxed ${message.type === "user" ? "text-white" : "text-gray-700"}`}>
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${message.type === "user" ? "text-pink-100" : "text-gray-400"}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">AI Coach</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Mimos AI..."
                className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                disabled={isLoading}
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
