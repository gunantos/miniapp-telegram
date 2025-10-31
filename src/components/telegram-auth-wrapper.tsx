'use client'

import { useEffect, useState } from 'react'
import { useTelegramWebApp, useAuth } from '@/hooks'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface TelegramAuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export default function TelegramAuthWrapper({ 
  children, 
  fallback, 
  requireAuth = false // Default to false for development
}: TelegramAuthWrapperProps) {
  const { webApp, user, isLoading: webAppLoading, error: webAppError, authenticate, isReady } = useTelegramWebApp()
  const { user: authUser, login, isLoading: authLoading, error: authError } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [forceDevMode, setForceDevMode] = useState(false)

  useEffect(() => {
    // Set a timeout to force development mode if Telegram takes too long
    const timeout = setTimeout(() => {
      if (!isReady && process.env.NODE_ENV === 'development') {
        console.log('Forcing development mode due to timeout')
        setForceDevMode(true)
      }
    }, 2000) // 2 seconds timeout

    return () => clearTimeout(timeout)
  }, [isReady])

  useEffect(() => {
    // Check if user is already authenticated
    if (authUser && webApp?.initData) {
      setIsAuthenticated(true)
    }
  }, [authUser, webApp])

  useEffect(() => {
    // Auto-authenticate when WebApp is ready and user is available
    if (isReady && webApp?.initData && user && !isAuthenticated && !isAuthenticating && !webAppLoading) {
      handleAutoAuth()
    }
  }, [isReady, webApp, user, isAuthenticated, isAuthenticating, webAppLoading])

  const handleAutoAuth = async () => {
    if (!webApp?.initData) return

    setIsAuthenticating(true)
    try {
      const success = await login(webApp.initData)
      if (success) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auto-authentication failed:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleManualAuth = async () => {
    if (!webApp?.initData) return

    setIsAuthenticating(true)
    try {
      const success = await login(webApp.initData)
      if (success) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Manual authentication failed:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Force development mode
  if (forceDevMode || process.env.NODE_ENV === 'development') {
    return (
      <>
        <div className="bg-blue-500/20 border border-blue-500/30 p-3 text-center">
          <p className="text-blue-300 text-sm">
            Mode Pengembangan: Aplikasi berjalan di luar Telegram Mini App
          </p>
          {webAppError && (
            <p className="text-blue-200 text-xs mt-1">
              Error: {webAppError}
            </p>
          )}
        </div>
        {children}
      </>
    )
  }

  // Loading state - but with timeout to prevent infinite loading
  if ((webAppLoading || isAuthenticating) && !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-white text-lg">
            {isAuthenticating ? 'Mengautentikasi...' : 'Memuat Telegram...'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    )
  }

  // If we're still loading but timeout was reached, show a message and continue
  if ((webAppLoading || isAuthenticating) && isReady) {
    return (
      <>
        <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 text-center">
          <p className="text-yellow-300 text-sm">
            Loading Telegram dalam progress... Aplikasi tetap berjalan
          </p>
        </div>
        {children}
      </>
    )
  }

  // Error state
  if (webAppError || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-300 mb-6">
            {webAppError || authError || 'Gagal memuat aplikasi'}
          </p>
          {webApp?.initData && (
            <button
              onClick={handleManualAuth}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    )
  }

  // Not in Telegram Mini App (development mode) - allow app to run
  if (!webApp && process.env.NODE_ENV === 'development') {
    return (
      <>
        <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 text-center">
          <p className="text-yellow-300 text-sm">
            Mode Pengembangan: Aplikasi berjalan di luar Telegram Mini App
          </p>
          {webAppError && (
            <p className="text-yellow-200 text-xs mt-1">
              Error: {webAppError}
            </p>
          )}
        </div>
        {children}
      </>
    )
  }

  // WebApp loaded but no user data (development mode or error state) - allow app to run
  if (webApp && !user && isReady && !webAppLoading) {
    return (
      <>
        <div className="bg-blue-500/20 border border-blue-500/30 p-3 text-center">
          <p className="text-blue-300 text-sm">
            Mode Pengembangan: Telegram WebApp terdeteksi tapi tidak ada user data
          </p>
          {webAppError && (
            <p className="text-blue-200 text-xs mt-1">
              Warning: {webAppError}
            </p>
          )}
        </div>
        {children}
      </>
    )
  }

  // Not authenticated but auth is required - show auth screen
  if (requireAuth && !isAuthenticated && webApp?.initData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md mx-4">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6 mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold mb-2">Selamat Datang!</h2>
            <p className="text-gray-300 mb-4">
              Kami mendeteksi bahwa Anda membuka aplikasi dari Telegram. 
              Silakan autentikasi untuk melanjutkan.
            </p>
            <button
              onClick={handleManualAuth}
              disabled={isAuthenticating}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengautentikasi...
                </div>
              ) : (
                'Autentikasi dengan Telegram'
              )}
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Data Anda akan aman dan hanya digunakan untuk pengalaman yang lebih baik.
          </p>
        </div>
      </div>
    )
  }

  // If we reach here, allow the app to run
  return <>{children}</>
}