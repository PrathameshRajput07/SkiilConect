import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Image, X, Send, Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react'
import { timeAgo, getInitials } from '../utils/helpers'

// ── Post card component ──────────────────────────────────────
function PostCard({ post, currentUserId, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const liked = post.likes?.includes(currentUserId)

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    await onComment(post._id, commentText)
    setCommentText('')
    setSubmitting(false)
  }

  return (
    <div className="card p-5 animate-fade-in">
      {/* Author row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.author?.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="avatar w-10 h-10" />
          ) : (
            <div className="avatar w-10 h-10 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
              {getInitials(post.author?.firstName, post.author?.lastName)}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-800 text-sm leading-tight">
              {post.author?.firstName} {post.author?.lastName}
            </div>
            <div className="text-xs text-slate-400">
              {post.author?.headline || post.author?.companyName} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        {post.author?._id === currentUserId && (
          <button
            onClick={() => onDelete(post._id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full rounded-xl object-cover max-h-96 mb-3 border border-slate-100"
        />
      )}

      {/* Stats row */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs text-slate-400">
        {post.likes?.length > 0 && (
          <span>{post.likes.length} like{post.likes.length !== 1 ? 's' : ''}</span>
        )}
        {post.comments?.length > 0 && (
          <button
            onClick={() => setShowComments(v => !v)}
            className="ml-auto hover:text-brand-600 transition-colors"
          >
            {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 pt-2">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center
            ${liked ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-brand-600' : ''}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors flex-1 justify-center"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {post.comments?.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="avatar w-7 h-7 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-xs flex-shrink-0">
                {getInitials(c.user?.firstName, c.user?.lastName)}
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
                <div className="font-medium text-slate-700 text-xs">
                  {c.user?.firstName} {c.user?.lastName}
                </div>
                <div className="text-slate-600 text-sm">{c.text}</div>
              </div>
            </div>
          ))}

          {/* Add comment input */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="input text-sm flex-1"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="btn-primary py-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Create post box ───────────────────────────────────────────
function CreatePost({ user, onPost }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!text.trim() && !image) return toast.error('Post cannot be empty')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('content', text)
      if (image) fd.append('image', image)
      const { data } = await api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onPost(data)
      setText('')
      setImage(null)
      setPreview(null)
      toast.success('Post published!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt="" className="avatar w-10 h-10" />
        ) : (
          <div className="avatar w-10 h-10 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
        )}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share an update, insight, or opportunity…"
          className="flex-1 resize-none bg-slate-50 rounded-xl px-4 py-3 text-sm border border-slate-200
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                     min-h-[80px] transition"
        />
      </div>

      {preview && (
        <div className="relative mt-3 ml-13">
          <img src={preview} alt="Preview" className="rounded-xl max-h-48 object-cover border border-slate-100" />
          <button
            onClick={() => { setImage(null); setPreview(null) }}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pl-13">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 text-sm font-medium
                     px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
        >
          <Image className="w-4 h-4" />
          Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <button
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !image)}
          className="btn-primary"
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}

// ── Main Feed Page ────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useApp()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = async (p = 1, replace = false) => {
    try {
      const { data } = await api.get(`/posts?page=${p}&limit=10`)
      setPosts(prev => replace ? data.posts : [...prev, ...data.posts])
      setHasMore(p < data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPosts(1, true) }, [])

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/${postId}/like`)
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p
        const liked = p.likes?.includes(user._id)
        return {
          ...p,
          likes: liked
            ? p.likes.filter(id => id !== user._id)
            : [...(p.likes || []), user._id],
        }
      }))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleComment = async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text })
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: data } : p))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p._id !== postId))
      toast.success('Post deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    loadPosts(next)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <CreatePost user={user} onPost={p => setPosts(prev => [p, ...prev])} />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?._id}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          ))}
          {hasMore && (
            <div className="text-center pt-2">
              <button onClick={handleLoadMore} className="btn-ghost">
                Load more posts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
