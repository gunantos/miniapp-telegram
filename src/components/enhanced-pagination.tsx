"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  SkipBack,
  SkipForward,
  List,
  Grid
} from "lucide-react"

interface EnhancedPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  showItemsPerPageSelect?: boolean
  variant?: "default" | "compact" | "minimal"
  viewType?: "grid" | "list"
  onViewTypeChange?: (viewType: "grid" | "list") => void
}

export default function EnhancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelect = true,
  variant = "default",
  viewType = "grid",
  onViewTypeChange
}: EnhancedPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState("")

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      const endPage = Math.min(totalPages, startPage + maxVisible - 1)

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push("...")
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...")
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage)
    if (page && page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpToPage("")
    }
  }

  const getStartItem = () => (currentPage - 1) * itemsPerPage + 1
  const getEndItem = () => Math.min(currentPage * itemsPerPage, totalItems)

  const itemsPerPageOptions = [
    { value: 6, label: "6 per page" },
    { value: 12, label: "12 per page" },
    { value: 24, label: "24 per page" },
    { value: 48, label: "48 per page" },
    { value: 96, label: "96 per page" }
  ]

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {getStartItem()}-{getEndItem()} of {totalItems}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="h-8 px-2 flex items-center text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        
        {showItemsPerPageSelect && (
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {getStartItem()}-{getEndItem()} of {totalItems} items
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Page</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onBlur={handleJumpToPage}
                  onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                  className="w-16 h-8 text-center text-sm"
                  placeholder={currentPage.toString()}
                />
                <span className="text-sm text-muted-foreground">of {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {showItemsPerPageSelect && (
              <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left side - Info and controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Items info */}
            <div className="text-sm text-muted-foreground">
              Showing {getStartItem()}-{getEndItem()} of {totalItems} results
            </div>
            
            {/* Items per page */}
            {showItemsPerPageSelect && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* View type toggle */}
            {onViewTypeChange && (
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewType === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewTypeChange("grid")}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewTypeChange("list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Right side - Page navigation */}
          <div className="flex items-center gap-2">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="h-8 px-2 flex items-center text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Jump to page */}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onBlur={handleJumpToPage}
                onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                className="w-16 h-8 text-center text-sm"
                placeholder="Go to"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleJumpToPage}
                disabled={!jumpToPage}
                className="h-8 px-3"
              >
                Go
              </Button>
            </div>
            
            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}