import ZAI from 'z-ai-web-dev-sdk'

export interface TelegramVideo {
  file_id: string
  file_unique_id: string
  file_size: number
  file_path: string
  width?: number
  height?: number
  duration?: number
  thumb?: {
    file_id: string
    file_unique_id: string
    file_size: number
    file_path: string
    width: number
    height: number
  }
  mime_type: string
}

export interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username?: string
    language_code?: string
  }
  chat: {
    id: number
    type: 'channel' | 'private' | 'group' | 'supergroup'
    title?: string
    username?: string
  }
  date: number
  video?: TelegramVideo
  caption?: string
  text?: string
}

export class TelegramBotService {
  private botToken: string
  private channelId: string

  constructor(botToken: string, channelId: string) {
    this.botToken = botToken
    this.channelId = channelId
  }

  async getChannelVideos(limit: number = 50, offset: number = 0): Promise<TelegramVideo[]> {
    try {
      // Use ZAI SDK to fetch channel messages
      const zai = await ZAI.create()
      
      const response = await zai.functions.invoke('get_channel_messages', {
        channel_id: this.channelId,
        limit,
        offset,
        filter: 'video' // Only get video messages
      })

      // Extract videos from messages
      const videos: TelegramVideo[] = []
      if (response && response.messages) {
        for (const message of response.messages) {
          if (message.video) {
            videos.push(message.video)
          }
        }
      }

      return videos
    } catch (error) {
      console.error('Error fetching channel videos:', error)
      throw new Error('Failed to fetch channel videos')
    }
  }

  async getVideoInfo(fileId: string): Promise<TelegramVideo> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`
      )

      if (!response.ok) {
        throw new Error('Failed to get video info')
      }

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to get video info')
      }

      return data.result
    } catch (error) {
      console.error('Error getting video info:', error)
      throw new Error('Failed to get video info')
    }
  }

  async getVideoStreamUrl(fileId: string): Promise<string> {
    try {
      const videoInfo = await this.getVideoInfo(fileId)
      
      if (!videoInfo.file_path) {
        throw new Error('Video file path not available')
      }

      return `https://api.telegram.org/file/bot${this.botToken}/${videoInfo.file_path}`
    } catch (error) {
      console.error('Error getting video stream URL:', error)
      throw new Error('Failed to get video stream URL')
    }
  }

  async sendVideoToChannel(
    videoUrl: string,
    caption: string,
    thumbnailUrl?: string
  ): Promise<TelegramMessage> {
    try {
      const formData = new FormData()
      formData.append('chat_id', this.channelId)
      formData.append('caption', caption)

      // If videoUrl is a local file path, read and upload it
      if (videoUrl.startsWith('/')) {
        const videoBlob = await fetch(videoUrl).then(res => res.blob())
        formData.append('video', videoBlob, 'video.mp4')
      } else {
        // If it's a remote URL, Telegram will download it
        formData.append('video', videoUrl)
      }

      if (thumbnailUrl) {
        if (thumbnailUrl.startsWith('/')) {
          const thumbBlob = await fetch(thumbnailUrl).then(res => res.blob())
          formData.append('thumb', thumbBlob, 'thumbnail.jpg')
        } else {
          formData.append('thumb', thumbnailUrl)
        }
      }

      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendVideo`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send video to channel')
      }

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send video to channel')
      }

      return data.result
    } catch (error) {
      console.error('Error sending video to channel:', error)
      throw new Error('Failed to send video to channel')
    }
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/deleteMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: this.channelId,
            message_id: messageId
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      const data = await response.json()
      return data.ok
    } catch (error) {
      console.error('Error deleting message:', error)
      throw new Error('Failed to delete message')
    }
  }

  async editMessageCaption(
    messageId: number,
    newCaption: string
  ): Promise<TelegramMessage> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/editMessageCaption`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: this.channelId,
            message_id: messageId,
            caption: newCaption
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to edit message caption')
      }

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to edit message caption')
      }

      return data.result
    } catch (error) {
      console.error('Error editing message caption:', error)
      throw new Error('Failed to edit message caption')
    }
  }

  // Helper method to extract video metadata
  async extractVideoMetadata(video: TelegramVideo): Promise<{
    duration: number
    width: number
    height: number
    fileSize: number
    mimeType: string
    hasThumbnail: boolean
  }> {
    return {
      duration: video.duration || 0,
      width: video.width || 0,
      height: video.height || 0,
      fileSize: video.file_size,
      mimeType: video.mime_type,
      hasThumbnail: !!video.thumb
    }
  }

  // Helper method to generate a safe filename
  generateSafeFilename(title: string, fileId: string): string {
    const safeTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
    
    return `${safeTitle}_${fileId.substring(0, 8)}`
  }
}

// Factory function to create Telegram bot service
export function createTelegramBotService(): TelegramBotService {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required')
  }

  if (!channelId) {
    throw new Error('TELEGRAM_CHANNEL_ID environment variable is required')
  }

  return new TelegramBotService(botToken, channelId)
}