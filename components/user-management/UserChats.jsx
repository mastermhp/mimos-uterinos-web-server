"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MessageSquare, Bot, User, Send, Eye, Trash2 } from 'lucide-react'

export default function UserChats({ userId }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    fetchChats()
  }, [userId])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ai/chat?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setChats(data.data)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          message: newMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh chats to show the new conversation
        fetchChats()
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const ChatDetailsDialog = ({ chat }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>AI Chat Conversation - {formatDate(chat.createdAt)}</DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
        {chat.messages.map((message, index) => (
          <div key={message.id || index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                {message.role === "user" ? (
                  <>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user`} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=ai`} />
                    <AvatarFallback className="bg-blue-100">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>AI Chat History</span>
              </CardTitle>
              <CardDescription>View and manage user's AI assistant conversations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No AI conversations yet</p>
              <p className="text-sm text-gray-400">User hasn't started any AI chats</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Card key={chat.id || chat._id || Math.random().toString(36).substr(2, 9)} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {chat.messages.length} messages
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(chat.createdAt)}</span>
                        </div>

                        {/* Show first user message as preview */}
                        {chat.messages.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm text-gray-700 line-clamp-2">{chat.messages[0].content}</p>
                            </div>

                            {/* Show AI response preview if available */}
                            {chat.messages.length > 1 && (
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-blue-100 text-xs">
                                    <Bot className="h-3 w-3 text-blue-600" />
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-gray-600 line-clamp-2">{chat.messages[1].content}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(chat)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedChat && <ChatDetailsDialog chat={selectedChat} />}
                        </Dialog>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send New Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Message as User</span>
          </CardTitle>
          <CardDescription>Send a message to the AI assistant on behalf of this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message to send to the AI assistant..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
