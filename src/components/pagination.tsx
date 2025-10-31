'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPageSelect?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelect = false
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 4 pages
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show ellipsis, current page - 1, current page, current page + 1, ellipsis
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-background border rounded-lg shadow-sm">
      {/* Info Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">
          Menampilkan {startItem}-{endItem} dari {totalItems} video
        </span>
        
        {showItemsPerPageSelect && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Tampilkan:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Page Numbers */}
      <div className="flex flex-col items-center gap-3">
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="h-8 px-2 flex items-center text-muted-foreground text-sm">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`h-8 w-8 p-0 text-sm ${
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

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Info */}
        <div className="text-xs text-muted-foreground">
          Halaman {currentPage} dari {totalPages}
        </div>
      </div>
    </div>
  )
}

// Alternative simple page number component for minimal design
export function SimplePagination({
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
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="h-8 w-8 p-0 text-sm"
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Compact pagination for mobile or tight spaces
export function CompactPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <div className="text-xs text-muted-foreground">
        {currentPage}/{totalPages} ({totalItems} items)
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-6 w-6 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}