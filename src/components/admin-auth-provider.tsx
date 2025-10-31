"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminAuthProviderProps {
  children: React.ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    try {
      const authStatus = sessionStorage.getItem('adminAuthenticated')
      const authTime = sessionStorage.getItem('adminAuthTime')
      
      if (authStatus === 'true' && authTime) {
        // Check if session is still valid (30 minutes timeout)
        const currentTime = Date.now()
        const sessionTime = parseInt(authTime)
        const sessionAge = currentTime - sessionTime
        const sessionTimeout = 30 * 60 * 1000 // 30 minutes
        
        if (sessionAge < sessionTimeout) {
          setIsAuthenticated(true)
          // Extend session time on activity
          sessionStorage.setItem('adminAuthTime', currentTime.toString())
        } else {
          // Session expired
          logout()
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminAuthTime')
    setIsAuthenticated(false)
    router.push('/admin/login')
  }

  // Auto-check authentication every minute
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkAuthentication, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Listen for storage changes (in case user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminAuthenticated' || e.key === 'adminAuthTime') {
        checkAuthentication()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-300">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page
    if (typeof window !== 'undefined') {
      router.push('/admin/login')
      return null
    }
    return null
  }

  return <>{children}</>
}