"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, action, duration = 5000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, action, duration },
      ])

      // Auto remove toast after duration
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, duration)
    },
    []
  )

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}