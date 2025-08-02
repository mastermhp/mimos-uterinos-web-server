// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import DashboardLayout from "@/components/DashboardLayout"
// import UserTable from "@/components/UserTable"
// import UserModal from "@/components/UserModal"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Search, Plus } from "lucide-react"

// export default function UsersPage() {
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0,
//   })
//   const router = useRouter()

//   useEffect(() => {
//     const token = localStorage.getItem("adminToken")
//     if (!token) {
//       router.push("/")
//       return
//     }
//     fetchUsers()
//   }, [pagination.page])

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("adminToken")
//       const response = await fetch(`/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setUsers(data.users)
//         setPagination(data.pagination)
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUserClick = (user) => {
//     setSelectedUser(user)
//     setIsModalOpen(true)
//   }

//   const handleDeleteUser = async (userId) => {
//     if (!confirm("Are you sure you want to delete this user?")) return

//     try {
//       const token = localStorage.getItem("adminToken")
//       const response = await fetch(`/api/admin/users/${userId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (response.ok) {
//         fetchUsers()
//       }
//     } catch (error) {
//       console.error("Error deleting user:", error)
//     }
//   }

//   const filteredUsers = users.filter(
//     (user) =>
//       user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Users</h1>
//             <p className="text-gray-600">Manage registered users</p>
//           </div>
//           <Button onClick={() => router.push("/dashboard/users/create")} className="bg-pink-600 hover:bg-pink-700">
//             <Plus className="h-4 w-4 mr-2" />
//             Add User
//           </Button>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>User Management</CardTitle>
//             <CardDescription>View and manage all registered users</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center space-x-4 mb-6">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search users..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>

//             <UserTable
//               users={filteredUsers}
//               loading={loading}
//               onUserClick={handleUserClick}
//               onDeleteUser={handleDeleteUser}
//             />

//             <div className="flex justify-between items-center mt-6">
//               <p className="text-sm text-gray-600">
//                 Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
//                 {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
//               </p>
//               <div className="flex space-x-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
//                   disabled={pagination.page === 1}
//                 >
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
//                   disabled={pagination.page === pagination.pages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <UserModal
//           user={selectedUser}
//           isOpen={isModalOpen}
//           onClose={() => {
//             setIsModalOpen(false)
//             setSelectedUser(null)
//           }}
//         />
//       </div>
//     </DashboardLayout>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Search, Filter, Eye, Edit, Trash2, Crown, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users?page=${currentPage}&limit=10&search=${searchTerm}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const UserDetailsDialog = ({ user }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Status</label>
            <Badge className={getStatusColor(user.status)}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Premium</label>
            <div className="flex items-center space-x-2">
              {user.premium ? (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="outline">Free</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Contact Information</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Born: {formatDate(user.dateOfBirth)}</span>
            </div>
          </div>
        </div>

        {/* Health Profile */}
        {user.profile && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Health Profile</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cycle Length:</span>
                <span className="ml-2 font-medium">{user.profile.cycleLength} days</span>
              </div>
              <div>
                <span className="text-gray-500">Period Length:</span>
                <span className="ml-2 font-medium">{user.profile.periodLength} days</span>
              </div>
              <div>
                <span className="text-gray-500">Last Period:</span>
                <span className="ml-2 font-medium">{formatDate(user.profile.lastPeriodDate)}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Day:</span>
                <span className="ml-2 font-medium">Day {user.profile.currentCycleDay}</span>
              </div>
            </div>

            {user.profile.symptoms && user.profile.symptoms.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Recent Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.profile.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {symptom.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Activity</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Joined:</span>
              <span className="ml-2 font-medium">{formatDate(user.joinDate)}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Active:</span>
              <span className="ml-2 font-medium">{formatDate(user.lastActive)}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500">Manage app users and their profiles</p>
              </div>
            </div>
            <Link href="/dashboard/users/new"><Button className="bg-blue-600 hover:bg-blue-700">Add New User</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>Manage and monitor all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.premium ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{formatDate(user.joinDate)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {selectedUser && <UserDetailsDialog user={selectedUser} />}
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

