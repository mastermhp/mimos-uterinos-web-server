"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Bot, User, Eye, Users, TrendingUp, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function AIPage() {
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState("all") // Updated default value to "all"
  const [selectedChat, setSelectedChat] = useState(null)
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    activeUsers: 0,
    avgMessagesPerChat: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch chats
      const chatsResponse = await fetch("/api/ai/chat")
      const chatsData = await chatsResponse.json()

      // Fetch users
      const usersResponse = await fetch("/api/users")
      const usersData = await usersResponse.json()

      if (chatsData.success) {
        setChats(chatsData.data)

        // Calculate stats
        const totalChats = chatsData.data.length
        const totalMessages = chatsData.data.reduce((sum, chat) => sum + chat.messages.length, 0)
        const activeUsers = new Set(chatsData.data.map((c) => c.userId)).size
        const avgMessagesPerChat = totalChats > 0 ? Math.round((totalMessages / totalChats) * 10) / 10 : 0

        setStats({
          totalChats,
          totalMessages,
          activeUsers,
          avgMessagesPerChat,
        })
      }

      if (usersData.success) {
        setUsers(usersData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : `User ${userId}`
  }

  const filteredChats = chats.filter((chat) => {
    const userName = getUserName(chat.userId).toLowerCase()
    const matchesSearch = userName.includes(searchTerm.toLowerCase())
    const matchesUser = selectedUser === "all" || chat.userId.toString() === selectedUser
    return matchesSearch && matchesUser
  })

  const ChatDetailsDialog = ({ chat }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>
          AI Chat - {getUserName(chat.userId)} - {formatDate(chat.createdAt)}
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
        {chat.messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                {message.role === "user" ? (
                  <>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getUserName(chat.userId)}`} />
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

      <div className="pt-4 border-t">
        <Link href={`/dashboard/users/${chat.userId}`}>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View User Profile
          </Button>
        </Link>
      </div>
    </DialogContent>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <span>AI Chat Management</span>
              </h1>
              <p className="text-gray-500">Monitor and analyze AI assistant conversations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Messages/Chat</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgMessagesPerChat}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat List */}
        <Card>
          <CardHeader>
            <CardTitle>AI Conversations</CardTitle>
            <CardDescription>View and manage all AI assistant conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading chats...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No chats found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChats.map((chat) => (
                  <Card key={chat.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getUserName(chat.userId)}`}
                              />
                              <AvatarFallback>
                                {getUserName(chat.userId)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/dashboard/users/${chat.userId}`}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                {getUserName(chat.userId)}
                              </Link>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Badge variant="outline" className="text-xs">
                                  {chat.messages.length} messages
                                </Badge>
                                <span>{formatDate(chat.createdAt)}</span>
                              </div>
                            </div>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
