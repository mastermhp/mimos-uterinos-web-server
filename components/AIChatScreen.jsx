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
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
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

      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        setChatHistory(data.data)
        const latestChat = data.data[0]
        setCurrentChatId(latestChat.id)
        if (latestChat.messages && latestChat.messages.length > 0) {
          const formattedMessages = latestChat.messages.map((msg, index) => ({
            id: msg.id || index + 1,
            type: msg.role === "user" ? "user" : "ai",
            content: msg.content,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
          setMessages(formattedMessages)
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadChat = (chat) => {
    setCurrentChatId(chat.id)
    if (chat.messages && chat.messages.length > 0) {
      const formattedMessages = chat.messages.map((msg, index) => ({
        id: msg.id || index + 1,
        type: msg.role === "user" ? "user" : "ai",
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
      setMessages(formattedMessages)
    } else {
      setMessages([
        {
          id: 1,
          type: "ai",
          content: `Hello ${user.name}! I'm your Mimos Uterinos AI health coach. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }
    setShowSidebar(false)
  }

  const deleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`/api/ai/chat/${chatId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
          if (currentChatId === chatId) {
            startNewChat()
          }
        }
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
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
          chatId: currentChatId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      if (data.data) {
        setCurrentChatId(data.data.id)
        const latestMessages = data.data.messages
        if (latestMessages && latestMessages.length > 0) {
          const latestAiMessage = latestMessages[latestMessages.length - 1]
          if (latestAiMessage.role === "assistant") {
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: latestAiMessage.content,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
            setMessages((prev) => [...prev, aiMessage])
          }
        }
      }

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

  const startNewChat = () => {
    setCurrentChatId(null)
    setMessages([
      {
        id: 1,
        type: "ai",
        content: `Hello ${user.name}! I'm your Mimos Uterinos AI health coach. I'm here to provide personalized insights based on your cycle data. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setShowSidebar(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex pb-24">
      {showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSidebar(false)}>
          <div className="w-80 bg-white h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={startNewChat}
                className="w-full mt-3 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
              >
                + New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Loading...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No chat history yet</p>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                        currentChatId === chat.id ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {chat.messages && chat.messages.length > 0
                              ? chat.messages[0].content.substring(0, 30) + "..."
                              : "New Chat"}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(chat.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                >
                  History ({chatHistory.length})
                </button>
                <button
                  onClick={startNewChat}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
                >
                  New Chat
                </button>
              </div>
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
    </div>
  )
}
