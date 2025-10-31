"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Reply, MoreHorizontal, Trash2 } from "lucide-react"
import { useComments } from "@/hooks/use-comments"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

interface CommentSectionProps {
  videoId: number
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth()
  const { comments, loading, error, pagination, postComment, loadMore } = useComments(videoId)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    const success = await postComment(newComment.trim())
    if (success) {
      setNewComment("")
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    const success = await postComment(replyContent.trim(), commentId)
    if (success) {
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const formatCommentTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id
      })
    } catch {
      return "Baru saja"
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.telegramPhotoUrl} />
                <AvatarFallback>
                  {getUserInitials(user.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Tambahkan komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/1000 karakter
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || loading}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Kirim
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">
            Komentar ({pagination.total})
          </h3>
        </div>

        {error && (
          <Card>
            <CardContent className="p-4 text-center text-red-500">
              {error}
            </CardContent>
          </Card>
        )}

        {loading && comments.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {comments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Belum ada komentar</h3>
              <p className="text-muted-foreground">
                Jadilah yang pertama berkomentar!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              formatCommentTime={formatCommentTime}
              getUserInitials={getUserInitials}
            />
          ))}
        </div>

        {/* Load More */}
        {pagination.page < pagination.totalPages && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Muat lebih banyak"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: any
  currentUser: any
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: (commentId: string) => void
  formatCommentTime: (date: string) => string
  getUserInitials: (name: string) => string
}

function CommentItem({
  comment,
  currentUser,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  formatCommentTime,
  getUserInitials
}: CommentItemProps) {
  const isReplying = replyingTo === comment.id

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.telegramPhotoUrl} />
            <AvatarFallback>
              {getUserInitials(comment.user.name || "User")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user.name}
              </span>
              {comment.user.telegramUsername && (
                <Badge variant="secondary" className="text-xs">
                  @{comment.user.telegramUsername}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatCommentTime(comment.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-foreground">
              {comment.content}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="h-6 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                {isReplying ? "Batal" : "Balas"}
              </Button>
            </div>
            
            {/* Reply Input */}
            {isReplying && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <Textarea
                  placeholder="Balas komentar..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {replyContent.length}/1000 karakter
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="gap-1 text-xs"
                  >
                    <Send className="h-3 w-3" />
                    Balas
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.user.telegramPhotoUrl} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(reply.user.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">
                          {reply.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCommentTime(reply.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-foreground">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}