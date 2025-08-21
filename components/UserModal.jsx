import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function UserModal({ user, isOpen, onClose }) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Detailed information about {user.name || user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-pink-600">{user.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.name || "Unknown User"}</h3>
              <p className="text-gray-600">{user.email}</p>
              <Badge variant={user.isVerified ? "default" : "secondary"} className="mt-1">
                {user.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span>{user.age || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span>{user.height ? `${user.height} cm` : "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span>{user.weight ? `${user.weight} kg` : "Not provided"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cycle Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cycle Length:</span>
                  <span>{user.cycleLength || 28} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period Length:</span>
                  <span>{user.periodLength || 5} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Period:</span>
                  <span>
                    {user.lastPeriodDate ? new Date(user.lastPeriodDate).toLocaleDateString() : "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Active:</span>
                <span>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span>{user.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium:</span>
                <span>{user.isPremium ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
