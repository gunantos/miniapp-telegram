# Sistem Scraping Video Metadata

## Overview

Sistem ini dirancang untuk melakukan scraping metadata video dari sumber eksternal dan menyimpannya ke database tanpa menyimpan file video itu sendiri. Pendekatan ini memastikan legal compliance dan efisiensi storage.

## Architecture

### Data Flow
```
Source Websites → Scraper API → Database → Frontend
     ↓                ↓           ↓          ↓
tv10.idlixku.com → /api/scrape → Prisma → React UI
```

### Components
1. **Scraper API** (`/api/scrape/route.ts`) - Melakukan scraping metadata
2. **Database** (Prisma + SQLite) - Menyimpan metadata video
3. **Admin Dashboard** (`/admin`) - Interface untuk mengelola scraping
4. **Frontend** - Menampilkan video dengan streaming dari source

## Sources

### Film
- **URL**: `https://tv10.idlixku.com/movie/`
- **Category**: `FILM`
- **Metadata**: Title, description, thumbnail URL, stream URL

### Serial TV
- **URL**: `https://tv10.idlixku.com/tvseries/`
- **Category**: `SERIAL`
- **Metadata**: Title, description, thumbnail URL, stream URL, seasons, episodes

### Kartun/Anime
- **URL**: `https://tv10.idlixku.com/genre/anime/`
- **Category**: `KARTUN`
- **Metadata**: Title, description, thumbnail URL, stream URL, episodes

## Database Schema

### Video Model
```typescript
model Video {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  thumbnailId String?  // For Telegram videos
  thumbnailUrl String? // For website videos
  status      VideoStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  viewCount   Int      @default(0)
  category    VideoCategory
  videoSource VideoSource
  videoUrl    String?  // Stream URL from source
  telegramFileId String? // For Telegram videos
  lastChecked DateTime? // Last scraping check
  isActive    Boolean  @default(true) // Video availability status
  
  // Relations
  serialParts SerialPart[]
  watchHistory WatchHistory[]
  videoLikes VideoLike[]
  comments Comment[]
}
```

## API Endpoints

### 1. Scraping API
- **POST** `/api/scrape` - Run scraping process
- **GET** `/api/scrape` - Get scraping statistics

#### Authentication
```bash
Authorization: Bearer admin-secret-token
```

#### Request (POST)
```json
{
  // Empty body - scrapes all sources
}
```

#### Response (POST)
```json
{
  "success": true,
  "data": {
    "processed": 9,
    "updated": 0,
    "skipped": 0,
    "total": 9,
    "breakdown": {
      "movies": 3,
      "series": 3,
      "anime": 3
    }
  },
  "message": "Video scraping completed successfully"
}
```

#### Response (GET)
```json
{
  "success": true,
  "data": {
    "totalVideos": 18,
    "activeVideos": 18,
    "websiteVideos": 9,
    "publishedVideos": 18,
    "inactiveVideos": 0,
    "categoryStats": {
      "DRAMA_PENDEK": 3,
      "FILM": 3,
      "SERIAL": 3,
      "KARTUN": 3
    },
    "recentVideos": [...]
  }
}
```

## Admin Dashboard

### Access
- **URL**: `/admin`
- **Authentication**: Bearer token (admin-secret-token)

### Features
1. **Run Scraping** - Manually trigger scraping process
2. **Statistics** - View scraping statistics
3. **Video Management** - Monitor video availability
4. **Category Breakdown** - View videos by category
5. **Recent Activity** - View recently scraped videos

### Usage
1. Click "Run Scraping" button to start scraping
2. Monitor progress with real-time updates
3. View statistics and video availability
4. Check recent scraping activity

## Scraper Implementation

### VideoScraper Class
```typescript
class VideoScraper {
  // Rate limiting to prevent blocking
  private delay(ms: number): Promise<void>
  
  // Retry mechanism for failed requests
  private async fetchWithRetry(url: string, retries = 3)
  
  // Scraping methods for each category
  async scrapeMovies(): Promise<any[]>
  async scrapeSeries(): Promise<any[]>
  async scrapeAnime(): Promise<any[]>
  
  // Check video availability
  async checkVideoAvailability(url: string): Promise<boolean>
}
```

### Features
- **Rate Limiting** - Prevents IP blocking with delays
- **Retry Logic** - Automatic retry for failed requests
- **Duplicate Detection** - Prevents duplicate videos
- **Availability Checking** - Monitors video availability
- **Error Handling** - Graceful error handling

## Video Streaming

### Streaming Logic
```typescript
const getStreamingUrl = () => {
  // Priority 1: Check database first
  if (video.videoUrl) {
    return video.videoUrl
  }
  
  // Priority 2: Fallback to source
  const sourceUrls = {
    'FILM': 'https://tv10.idlixku.com/movie/',
    'SERIAL': 'https://tv10.idlixku.com/tvseries/',
    'KARTUN': 'https://tv10.idlixku.com/genre/anime/'
  }
  
  return sourceUrls[video.category]
}
```

### Error Handling
- **Broken Links** - Automatic fallback to source
- **Unavailable Videos** - Marked as inactive
- **Source Changes** - Regular availability checks

## Configuration

### Environment Variables
```env
# Admin authentication
NEXT_PUBLIC_ADMIN_TOKEN=admin-secret-token
ADMIN_TOKEN=admin-secret-token

# Database
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

## Legal Considerations

### Metadata Only
- **No Copyright Infringement** - Only stores metadata, not video files
- **Fair Use** - Similar to search engines indexing
- **Source Attribution** - Videos streamed from original sources

### Compliance
- **Terms of Service** - Respects source website terms
- **Rate Limiting** - Prevents server overload
- **Robots.txt** - Follows crawling guidelines

## Benefits

### Technical Benefits
- **Storage Efficient** - Only metadata stored
- **Fast Performance** - Database queries are fast
- **Scalable** - Easy to add new sources
- **Maintainable** - Clean separation of concerns

### Business Benefits
- **Legal Safety** - No copyright issues
- **Cost Effective** - No storage costs for videos
- **Reliable** - Multiple fallback options
- **User Friendly** - Seamless streaming experience

## Future Enhancements

### Planned Features
1. **Real-time Scraping** - Automatic scheduled scraping
2. **Multiple Sources** - Add more video sources
3. **Quality Metrics** - Video quality scoring
4. **User Preferences** - Personalized recommendations
5. **Advanced Search** - Full-text search capabilities

### Technical Improvements
1. **Caching Layer** - Redis for better performance
2. **Load Balancing** - Multiple scraper instances
3. **Monitoring** - Comprehensive logging and monitoring
4. **API Rate Limiting** - Prevent abuse
5. **CDN Integration** - Faster thumbnail delivery

## Troubleshooting

### Common Issues
1. **Scraping Fails** - Check internet connection and source availability
2. **Authentication Error** - Verify admin token
3. **Database Errors** - Check database connection
4. **Video Not Playing** - Check source URL and availability

### Debug Steps
1. Check server logs for errors
2. Verify environment variables
3. Test source URLs manually
4. Check database connection
5. Verify admin authentication

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify configuration
4. Test individual components