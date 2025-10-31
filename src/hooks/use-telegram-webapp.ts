'use client'

import { useEffect, useState, useCallback } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_bot?: boolean
  photo_url?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    receiver?: TelegramUser
    chat?: {
      id: number
      type: string
      title: string
      username?: string
      photo_url?: string
    }
    start_param?: string
    auth_date: number
    hash: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  backButton?: {
    isVisible: boolean
    onClick: () => void
    show: () => void
    hide: () => void
  }
  mainButton?: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    onClick: () => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
    setText: (text: string) => void
    setColor: (color: string) => void
    setTextColor: (color: string) => void
  }
  hapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  cloudStorage?: {
    setItem: (key: string, value: string) => Promise<void>
    getItem: (key: string) => Promise<string | null>
    getItems: () => Promise<{ key: string; value: string }[]>
    removeItem: (key: string) => Promise<void>
    removeItems: (keys: string[]) => Promise<void>
  }
  closingConfirmation?: {
    show: () => void
    hide: () => void
  }
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  sendData: (data: string) => void
  ready: () => void
  expand: () => void
  close: () => void
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

interface UseTelegramWebAppReturn {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  isLoading: boolean
  error: string | null
  isReady: boolean
  authenticate: () => Promise<{ user: any; sessionToken: string } | null>
  sendDataToBot: (data: any) => void
  hapticImpact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  hapticNotification: (type: 'error' | 'success' | 'warning') => void
  setMainButton: (text: string, onClick: () => void, color?: string) => void
  hideMainButton: () => void
  showBackButton: (onClick: () => void) => void
  hideBackButton: () => void
  expand: () => void
  close: () => void
}

export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize Telegram Web App
  useEffect(() => {
    const initializeWebApp = () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          setWebApp(tg)
          
          if (tg.initDataUnsafe.user) {
            setUser(tg.initDataUnsafe.user)
          }
          
          // Set up theme
          document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff')
          document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000')
          document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999')
          document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2678b6')
          document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2678b6')
          document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff')
          
          // Handle viewport changes
          tg.onEvent('viewportChanged', () => {
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`)
            document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`)
          })
          
          // Set initial viewport
          document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`)
          document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`)
          
          tg.ready()
          setIsReady(true)
          setIsLoading(false)
        } else {
          // For development outside Telegram
          console.log('Telegram WebApp not found, running in development mode')
          setIsReady(true)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram WebApp')
        setIsLoading(false)
        setIsReady(true) // Allow app to continue even if Telegram fails
      }
    }

    // Load Telegram WebApp script with better error handling
    if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
      console.log('Loading Telegram WebApp script...')
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]')
      if (existingScript) {
        console.log('Script already exists, initializing...')
        initializeWebApp()
        return
      }

      // Try multiple CDN sources for better reliability
      const cdnSources = [
        'https://telegram.org/js/telegram-web-app.js',
        'https://cdn.jsdelivr.net/npm/@telegram-apps/sdk@0.20.0/dist/telegram-web-app.js',
        'https://unpkg.com/@telegram-apps/sdk@0.20.0/dist/telegram-web-app.js'
      ]

      let currentSourceIndex = 0
      const loadScriptFromSource = (sourceIndex: number) => {
        if (sourceIndex >= cdnSources.length) {
          console.error('All CDN sources failed')
          setError('Failed to load Telegram WebApp script from all sources')
          setIsLoading(false)
          setIsReady(true)
          return
        }

        const source = cdnSources[sourceIndex]
        console.log(`Trying to load from: ${source}`)
        
        // Remove any existing script
        const oldScript = document.querySelector('script[src^="https://telegram.org/js/telegram-web-app.js"], script[src^="https://cdn.jsdelivr.net"], script[src^="https://unpkg.com"]')
        if (oldScript) {
          oldScript.remove()
        }

        const script = document.createElement('script')
        script.src = source
        script.async = true
        script.crossOrigin = 'anonymous'
        
        // Set timeout for script loading
        const timeoutId = setTimeout(() => {
          console.warn(`Telegram WebApp script loading timeout for ${source}`)
          script.remove()
          loadScriptFromSource(sourceIndex + 1) // Try next source
        }, 3000) // 3 second timeout per source

        script.onload = () => {
          clearTimeout(timeoutId)
          console.log(`Telegram WebApp script loaded successfully from ${source}`)
          initializeWebApp()
        }
        
        script.onerror = () => {
          clearTimeout(timeoutId)
          console.error(`Failed to load from ${source}`)
          loadScriptFromSource(sourceIndex + 1) // Try next source
        }
        
        // Add script to head
        document.head.appendChild(script)
      }

      loadScriptFromSource(0)
    } else {
      initializeWebApp()
    }

    // Set a timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing ready state')
        setIsLoading(false)
        setIsReady(true)
      }
    }, 5000) // 5 second timeout

    return () => {
      // Cleanup: remove timeout
      clearTimeout(loadingTimeout)
      
      // Cleanup: remove script if needed
      const scripts = document.querySelectorAll('script[src^="https://telegram.org"], script[src^="https://cdn.jsdelivr.net"], script[src^="https://unpkg.com"]')
      scripts.forEach(script => {
        // Don't remove script as it might be needed by other components
        console.log('Cleanup: Telegram WebApp script remains in DOM')
      })
    }
  }, [])

  const authenticate = useCallback(async () => {
    if (!webApp?.initData) {
      setError('No init data available')
      return null
    }

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: webApp.initData
        })
      })

      const result = await response.json()

      if (result.success) {
        return result.data
      } else {
        setError(result.error || 'Authentication failed')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error')
      return null
    }
  }, [webApp])

  const sendDataToBot = useCallback((data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data))
    }
  }, [webApp])

  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (webApp?.hapticFeedback) {
      webApp.hapticFeedback.impactOccurred(style)
    }
  }, [webApp])

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    if (webApp?.hapticFeedback) {
      webApp.hapticFeedback.notificationOccurred(type)
    }
  }, [webApp])

  const setMainButton = useCallback((text: string, onClick: () => void, color?: string) => {
    if (webApp?.mainButton) {
      webApp.mainButton.setText(text)
      webApp.mainButton.onClick = onClick
      if (color) {
        webApp.mainButton.setColor(color)
      }
      webApp.mainButton.show()
      webApp.mainButton.enable()
    }
  }, [webApp])

  const hideMainButton = useCallback(() => {
    if (webApp?.mainButton) {
      webApp.mainButton.hide()
    }
  }, [webApp])

  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp?.backButton) {
      webApp.backButton.onClick = onClick
      webApp.backButton.show()
    }
  }, [webApp])

  const hideBackButton = useCallback(() => {
    if (webApp?.backButton) {
      webApp.backButton.hide()
    }
  }, [webApp])

  const expand = useCallback(() => {
    if (webApp) {
      webApp.expand()
    }
  }, [webApp])

  const close = useCallback(() => {
    if (webApp) {
      webApp.close()
    }
  }, [webApp])

  return {
    webApp,
    user,
    isLoading,
    error,
    isReady,
    authenticate,
    sendDataToBot,
    hapticImpact,
    hapticNotification,
    setMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    expand,
    close
  }
}