"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Calendar, Film, SlidersHorizontal, User, History, Settings } from "lucide-react"
import VideoCard from "@/components/video-card"
import LazyVideoGrid from "@/components/lazy-video-grid"
import VideoPlayer from "@/components/video-player"
import TelegramAuthWrapper from "@/components/telegram-auth-wrapper"
import { ThemeToggle } from "@/components/theme-toggle"
import { Pagination, SimplePagination, CompactPagination } from "@/components/pagination"
import { PageNumbers, JumpToPage, PageSizeSelector } from "@/components/page-numbers"
import EnhancedPagination from "@/components/enhanced-pagination"
import { useVideos, useAuth, useTelegramWebApp, useWatchHistory } from "@/hooks"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

export default function Home() {
  const [activeTab, setActiveTab] = useState("drama_pendek")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false)
  const [viewType, setViewType] = useState<"grid" | "list">("grid")

  const { user, logout } = useAuth()
  const { webApp, setMainButton, hideMainButton, close } = useTelegramWebApp()
  const { history, addToHistory } = useWatchHistory()

  const categories = [
    { id: "drama_pendek", label: "Drama Pendek" },
    { id: "film", label: "Film" },
    { id: "serial", label: "Serial" },
    { id: "kartun", label: "Kartun" }
  ]

  const sortOptions = [
    { value: "latest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "most_viewed", label: "Paling Banyak Dilihat" },
    { value: "least_viewed", label: "Paling Sedikit Dilihat" }
  ]

  // Fetch videos based on current tab and filters
  const { 
    videos, 
    loading, 
    error, 
    hasNextPage, 
    hasPreviousPage, 
    totalPages, 
    totalItems 
  } = useVideos(
    activeTab === "all" ? "ALL" : activeTab.toUpperCase(),
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage
  )

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video)
    setShowPlayer(true)
    
    // Add to watch history
    if (user) {
      addToHistory(video.id)
    }
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
    setSelectedVideo(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleLoadMore = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, sortBy])

  const handleUserMenu = () => {
    if (webApp) {
      setMainButton("Keluar", () => {
        logout()
        close()
      }, "#ef4444")
    }
  }

  const handleHistoryClick = () => {
    setShowHistory(!showHistory)
  }

  const handleAdminClick = () => {
    window.open('/admin/login', '_blank')
  }

  return (
    <TelegramAuthWrapper>
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-800/30 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/25">
                  <Film className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    StreamApp
                  </h1>
                  <p className="text-xs text-purple-300">Video streaming platform</p>
                </div>
              </div>

              {/* User Menu & Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* Search Bar - Full width on mobile */}
                <div className="w-full sm:flex-1 sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                    <Input
                      placeholder="Cari video..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-11 text-sm bg-white/10 border-purple-500/30 text-white placeholder-purple-300 focus:bg-white/20 focus:border-cyan-400 backdrop-blur-sm w-full"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Admin Button */}
                  <button
                    onClick={handleAdminClick}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Admin Dashboard"
                  >
                    <Settings className="h-5 w-5 text-purple-300" />
                  </button>

                  {/* History Button */}
                  <button
                    onClick={handleHistoryClick}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <History className="h-5 w-5 text-purple-300" />
                  </button>

                  {/* User Menu */}
                  {user && (
                    <button
                      onClick={handleUserMenu}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {user.telegramPhotoUrl ? (
                        <img 
                          src={user.telegramPhotoUrl} 
                          alt={user.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-purple-300" />
                      )}
                      <span className="text-white text-sm font-medium hidden sm:block">
                        {user.name}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {showHistory ? (
            /* Watch History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Riwayat Tontonan</h2>
                <button
                  onClick={handleHistoryClick}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Kembali
                </button>
              </div>
              
              {history.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Belum ada riwayat</h3>
                    <p className="text-muted-foreground">
                      Mulai menonton video untuk melihat riwayat tontonan Anda
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {history.map((item) => (
                    <VideoCard
                      key={item.id}
                      video={{
                        ...item.video,
                        progress: item.progress,
                        duration: item.duration,
                        completed: item.completed
                      }}
                      onClick={() => handleVideoClick(item.video)}
                      showProgress={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Category Tabs with Filter */
            <div className="space-y-4 mb-6">
              {/* Modern Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-13 bg-gradient-to-r from-slate-800 to-slate-900 p-1 rounded-xl shadow-lg border border-slate-700/50">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 rounded-lg"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Modern Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SlidersHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Video Count */}
                    <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {videos.length > 0 && (
                        <span className="font-medium">{videos.filter(video => video.category === activeTab.toUpperCase()).length} video ditemukan</span>
                      )}
                    </div>
                    
                    {/* Toggle Button */}
                    <button
                      onClick={() => setUseInfiniteScroll(!useInfiniteScroll)}
                      className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      {useInfiniteScroll ? "Use Pagination" : "Use Infinite Scroll"}
                    </button>
                  </div>
                </div>

                {/* Video Content */}
                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-0">
                    {loading && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="aspect-video bg-muted animate-pulse" />
                            <CardContent className="p-3">
                              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {error && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">Error: {error}</p>
                        </CardContent>
                      </Card>
                    )}

                    {!loading && !error && videos.length === 0 && (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="text-6xl mb-4">🎬</div>
                          <h3 className="text-lg font-semibold mb-2">Tidak ada video ditemukan</h3>
                          <p className="text-muted-foreground">
                            {searchQuery 
                              ? `Tidak ada video yang cocok dengan pencarian "${searchQuery}"`
                              : `Belum ada video di kategori ${category.label}`
                            }
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Video Grid - Only show when there are videos */}
                    {!loading && !error && videos.length > 0 && (
                      <>
                        {useInfiniteScroll ? (
                          // Infinite Scroll Mode
                          <LazyVideoGrid
                            videos={videos.filter(video => video.category === category.id.toUpperCase())}
                            onVideoClick={handleVideoClick}
                            showProgress={false}
                            initialLoadCount={12}
                            loadMoreCount={12}
                            hasNextPage={hasNextPage}
                            onLoadMore={handleLoadMore}
                            loading={loading}
                          />
                        ) : (
                          // Traditional Pagination Mode
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {videos
                              .filter(video => video.category === category.id.toUpperCase())
                              .map((video) => (
                                <VideoCard
                                  key={video.id}
                                  video={video}
                                  onClick={() => handleVideoClick(video)}
                                />
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                ))}
                
                {/* Pagination Controls - Only show in pagination mode and when there are multiple pages */}
                {!useInfiniteScroll && totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <EnhancedPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={setItemsPerPage}
                      variant="default"
                      viewType={viewType}
                      onViewTypeChange={setViewType}
                    />
                  </div>
                )}
              </Tabs>
            </div>
          )}
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Video Player Modal */}
        {showPlayer && selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClosePlayer}
            isOpen={showPlayer}
          />
        )}
      </div>
    </TelegramAuthWrapper>
  )
}