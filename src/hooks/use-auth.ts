'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  name: string
  email?: string
  telegramId?: number
  telegramUsername?: string
  telegramPhotoUrl?: string
  preferences?: {
    theme: string
    language: string
    quality: string
    autoplay: boolean
    notifications: boolean
  }
}

interface WatchHistoryItem {
  id: string
  userId: string
  videoId: number
  serialPartId?: number
  watchedAt: string
  progress: number
  duration?: number
  completed: boolean
  video: {
    id: number
    title: string
    description?: string
    thumbnailId?: string
    category: string
    videoSource: string
  }
  serialPart?: {
    id: number
    partNumber: number
    videoFileId: string
  }
}

interface UseAuthReturn {
  user: User | null
  sessionToken: string | null
  isLoading: boolean
  error: string | null
  login: (initData: string) => Promise<boolean>
  logout: () => void
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<boolean>
}

interface UseWatchHistoryReturn {
  history: WatchHistoryItem[]
  isLoading: boolean
  error: string | null
  addToHistory: (videoId: number, serialPartId?: number, progress?: number, duration?: number, completed?: boolean) => Promise<boolean>
  removeFromHistory: (videoId: number, serialPartId?: number) => Promise<boolean>
  getVideoProgress: (videoId: number, serialPartId?: number) => { progress: number; duration?: number; completed: boolean } | null
  refetch: () => void
}

// Auth hook
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sessionToken')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setSessionToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (initData: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.data.user)
        setSessionToken(result.data.sessionToken)
        
        // Save to localStorage
        localStorage.setItem('sessionToken', result.data.sessionToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        return true
      } else {
        setError(result.error || 'Login failed')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login error'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setSessionToken(null)
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('user')
  }, [])

  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>): Promise<boolean> => {
    if (!sessionToken) {
      setError('No session token')
      return false
    }

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ preferences })
      })

      const result = await response.json()

      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          preferences: { ...prev.preferences, ...preferences }
        } : null)
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify({
          ...user,
          preferences: { ...user?.preferences, ...preferences }
        }))
        
        return true
      } else {
        setError(result.error || 'Failed to update preferences')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update preferences error'
      setError(errorMessage)
      return false
    }
  }, [sessionToken, user])

  return {
    user,
    sessionToken,
    isLoading,
    error,
    login,
    logout,
    updatePreferences
  }
}

// Watch History hook
export function useWatchHistory(): UseWatchHistoryReturn {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { sessionToken } = useAuth()

  const fetchHistory = useCallback(async () => {
    if (!sessionToken) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/history', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setHistory(result.data)
      } else {
        setError(result.error || 'Failed to fetch history')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fetch history error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [sessionToken])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const addToHistory = useCallback(async (
    videoId: number,
    serialPartId?: number,
    progress: number = 0,
    duration?: number,
    completed: boolean = false
  ): Promise<boolean> => {
    if (!sessionToken) {
      setError('No session token')
      return false
    }

    try {
      const response = await fetch('/api/user/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          videoId,
          serialPartId,
          progress,
          duration,
          completed
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setHistory(prev => {
          const existingIndex = prev.findIndex(item => 
            item.videoId === videoId && 
            item.serialPartId === serialPartId
          )
          
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = result.data
            return updated
          } else {
            return [result.data, ...prev]
          }
        })
        
        return true
      } else {
        setError(result.error || 'Failed to add to history')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Add to history error'
      setError(errorMessage)
      return false
    }
  }, [sessionToken])

  const removeFromHistory = useCallback(async (
    videoId: number,
    serialPartId?: number
  ): Promise<boolean> => {
    if (!sessionToken) {
      setError('No session token')
      return false
    }

    try {
      const response = await fetch(`/api/user/history?videoId=${videoId}${serialPartId ? `&serialPartId=${serialPartId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setHistory(prev => prev.filter(item => 
          !(item.videoId === videoId && item.serialPartId === serialPartId)
        ))
        
        return true
      } else {
        setError(result.error || 'Failed to remove from history')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Remove from history error'
      setError(errorMessage)
      return false
    }
  }, [sessionToken])

  const getVideoProgress = useCallback((
    videoId: number,
    serialPartId?: number
  ): { progress: number; duration?: number; completed: boolean } | null => {
    const item = history.find(item => 
      item.videoId === videoId && item.serialPartId === serialPartId
    )
    
    return item ? {
      progress: item.progress,
      duration: item.duration,
      completed: item.completed
    } : null
  }, [history])

  return {
    history,
    isLoading,
    error,
    addToHistory,
    removeFromHistory,
    getVideoProgress,
    refetch: fetchHistory
  }
}