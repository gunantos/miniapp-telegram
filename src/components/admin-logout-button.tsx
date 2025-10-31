"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Shield } from "lucide-react"

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminAuthTime')
    
    // Redirect to login page
    router.push('/admin/login')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}