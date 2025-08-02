"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Trash2 } from "lucide-react"

export default function UserTable({ users, loading, onUserClick, onDeleteUser }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Last Active</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-pink-600">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name || "Unknown"}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={user.isVerified ? "default" : "secondary"}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onUserClick(user)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
