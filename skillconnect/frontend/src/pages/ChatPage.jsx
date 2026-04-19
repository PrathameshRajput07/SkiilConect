import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Send, Search, MessageSquare, Circle } from 'lucide-react'
import { timeAgo, getInitials } from '../utils/helpers'

// ── Single message bubble ─────────────────────────────────────
function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isOwn
          ? 'bg-brand-600 text-white rounded-br-sm'
          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm'
        }`}
      >
        <p>{msg.content}</p>
        <div className={`text-[10px] mt-1 ${isOwn ? 'text-brand-200' : 'text-slate-400'}`}>
          {timeAgo(msg.createdAt || msg.timestamp)}
        </div>
      </div>
    </div>
  )
}

// ── Conversation list item ────────────────────────────────────
function ConversationItem({ conv, currentUserId, isActive, onClick, onlineUsers }) {
  const other = conv.participants?.find(p => p._id !== currentUserId)
  const isOnline = onlineUsers.includes(other?._id)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors
        ${isActive ? 'bg-brand-50 border-r-2 border-brand-500' : ''}`}
    >
      <div className="relative flex-shrink-0">
        {other?.profilePhoto ? (
          <img src={other.profilePhoto} alt="" className="avatar w-10 h-10" />
        ) : (
          <div className="avatar w-10 h-10 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
            {getInitials(other?.firstName, other?.lastName)}
          </div>
        )}
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-800 text-sm truncate">
          {other?.firstName} {other?.lastName}
        </div>
        <div className="text-xs text-slate-400 truncate">{conv.lastMessage || 'Start a conversation'}</div>
      </div>
      <div className="text-xs text-slate-300 flex-shrink-0">
        {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}
      </div>
    </button>
  )
}

// ── Main Chat Page ────────────────────────────────────────────
export default function ChatPage() {
  const { userId: targetUserId } = useParams()
  const { user, socket, onlineUsers } = useApp()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimer, setTypingTimer] = useState(null)
  const messagesEndRef = useRef(null)

  // Search states for finding users
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data } = await api.get(`/users/search?q=${searchQuery}`)
        // Hide current user from search results
        setSearchResults(data.filter(u => u._id !== user?._id))
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, user])

  const startNewConversation = async (targetUser) => {
    // Open existing or create new chat directly
    const existing = conversations.find(c => c.participants.some(p => p._id === targetUser._id))
    if (existing) {
      openConversation(existing)
      setSearchQuery('')
      return
    }
    try {
      const { data: conv } = await api.post('/messages/conversation', { recipientId: targetUser._id })
      setConversations(prev => [conv, ...prev])
      openConversation(conv)
      setSearchQuery('')
    } catch(err) {
      toast.error('Failed to start conversation')
    }
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/messages/conversations')
        setConversations(data)

        // If targetUserId param, open that conversation
        if (targetUserId) {
          const existing = data.find(c =>
            c.participants.some(p => p._id === targetUserId)
          )
          if (existing) {
            openConversation(existing)
          } else {
            // Create new conversation
            const { data: conv } = await api.post('/messages/conversation', { recipientId: targetUserId })
            setConversations(prev => [conv, ...prev])
            openConversation(conv)
          }
        }
      } catch (err) {
        toast.error(err.message)
      }
    }
    load()
  }, [targetUserId])

  // Listen for incoming socket messages
  useEffect(() => {
    if (!socket) return
    socket.on('message:receive', (msg) => {
      if (msg.conversationId === activeConv?._id) {
        setMessages(prev => [...prev, { ...msg, _id: Date.now() }])
      }
      // Update last message in conversations list
      setConversations(prev => prev.map(c =>
        c._id === msg.conversationId
          ? { ...c, lastMessage: msg.content, lastMessageAt: msg.timestamp }
          : c
      ))
    })
    socket.on('typing:start', () => setIsTyping(true))
    socket.on('typing:stop', () => setIsTyping(false))
    return () => {
      socket.off('message:receive')
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [socket, activeConv])

  const openConversation = async (conv) => {
    setActiveConv(conv)
    setLoading(true)
    try {
      const { data } = await api.get(`/messages/${conv._id}`)
      setMessages(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return
    const content = text.trim()
    setText('')

    // Optimistic UI
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      content,
      sender: { _id: user._id },
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      // Persist to DB
      await api.post(`/messages/${activeConv._id}`, { content })

      // Emit via socket for real-time delivery
      const other = activeConv.participants?.find(p => p._id !== user._id)
      if (socket && other) {
        socket.emit('message:send', {
          senderId: user._id,
          receiverId: other._id,
          content,
          conversationId: activeConv._id,
        })
      }

      // Update last message in list
      setConversations(prev => prev.map(c =>
        c._id === activeConv._id
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      ))
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    if (!socket || !activeConv) return
    const other = activeConv.participants?.find(p => p._id !== user._id)
    if (!other) return
    socket.emit('typing:start', { receiverId: other._id })
    clearTimeout(typingTimer)
    const t = setTimeout(() => socket.emit('typing:stop', { receiverId: other._id }), 1500)
    setTypingTimer(t)
  }

  const activeOther = activeConv?.participants?.find(p => p._id !== user?._id)

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-card">
      {/* ── Sidebar ─────────────────────────── */}
      <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="input pl-9 text-sm" 
              placeholder="Search users by name or email…" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {searchQuery.trim() ? (
            isSearching ? (
              <div className="p-8 text-center text-slate-400 text-sm">Searching users...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No users found</div>
            ) : (
              searchResults.map(u => (
                <button
                  key={u._id}
                  onClick={() => startNewConversation(u)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt="" className="avatar w-10 h-10" />
                    ) : (
                      <div className="avatar w-10 h-10 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
                        {getInitials(u.firstName, u.lastName)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email || u.headline || 'SkillConnect Member'}</div>
                  </div>
                </button>
              ))
            )
          ) : (
            conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <ConversationItem
                  key={conv._id}
                  conv={conv}
                  currentUserId={user?._id}
                  isActive={activeConv?._id === conv._id}
                  onClick={() => openConversation(conv)}
                  onlineUsers={onlineUsers}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* ── Chat area ───────────────────────── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              {activeOther?.profilePhoto ? (
                <img src={activeOther.profilePhoto} alt="" className="avatar w-10 h-10" />
              ) : (
                <div className="avatar w-10 h-10 bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
                  {getInitials(activeOther?.firstName, activeOther?.lastName)}
                </div>
              )}
              {onlineUsers.includes(activeOther?._id) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                {activeOther?.firstName} {activeOther?.lastName}
              </div>
              <div className="text-xs text-slate-400">
                {onlineUsers.includes(activeOther?._id) ? (
                  <span className="text-green-500">● Online</span>
                ) : (
                  activeOther?.headline || activeOther?.companyName || 'Offline'
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 bg-slate-50">
            {loading ? (
              <div className="flex justify-center items-center h-full text-slate-400 text-sm">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-slate-400 text-center">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg._id}
                    msg={msg}
                    isOwn={msg.sender?._id === user?._id || msg.senderId === user?._id}
                  />
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    typing…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={handleTyping}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a message…"
                className="input flex-1"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="btn-primary px-4"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
          <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Or start a new one from someone's profile</p>
        </div>
      )}
    </div>
  )
}
