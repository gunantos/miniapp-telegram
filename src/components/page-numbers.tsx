'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface PageNumbersProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
  showEdges?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function PageNumbers({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 7,
  showEdges = true,
  size = 'sm',
  variant = 'outline'
}: PageNumbersProps) {
  if (totalPages <= 1) {
    return null
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'lg':
        return 'h-10 w-10 text-base'
      case 'md':
        return 'h-9 w-9 text-sm'
      case 'sm':
      default:
        return 'h-8 w-8 text-sm'
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2)
      
      if (showEdges) {
        // Always show first page
        pages.push(1)

        if (currentPage <= halfVisible + 1) {
          // Near the start
          for (let i = 2; i <= maxVisible - 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - halfVisible) {
          // Near the end
          pages.push('...')
          for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          // Middle
          pages.push('...')
          for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      } else {
        // No edges - just show pages around current
        const start = Math.max(1, currentPage - halfVisible)
        const end = Math.min(totalPages, currentPage + halfVisible)
        
        if (start > 1) {
          pages.push('...')
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (end < totalPages) {
          pages.push('...')
        }
      }
    }

    return pages
  }

  return (
    <div className="flex items-center gap-1">
      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className={`flex items-center justify-center ${getSizeClasses()} text-muted-foreground`}>
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : variant}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`${getSizeClasses()} p-0 ${
                currentPage === page 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {page}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

// Minimal page numbers with just current page info
export function MinimalPageNumbers({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-6 w-6 p-0"
      >
        ←
      </Button>
      
      <span className="text-sm text-muted-foreground min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-6 w-6 p-0"
      >
        →
      </Button>
    </div>
  )
}

// Jump to page component
export function JumpToPage({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(inputValue)
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
      setInputValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Jump to:</span>
      <input
        type="number"
        min="1"
        max={totalPages}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={currentPage.toString()}
        className="w-16 h-8 px-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" size="sm" className="h-8 px-3">
        Go
      </Button>
    </form>
  )
}

// Page size selector
export function PageSizeSelector({
  currentSize,
  onSizeChange,
  options = [8, 12, 24, 48, 96]
}: {
  currentSize: number
  onSizeChange: (size: number) => void
  options?: number[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Items per page:</span>
      <select
        value={currentSize}
        onChange={(e) => onSizeChange(parseInt(e.target.value))}
        className="h-8 px-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}