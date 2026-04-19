import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUser, UserButton, useClerk } from '@clerk/clerk-react'
import { useApp } from '../../context/AppContext'
import {
  Home, Briefcase, LayoutDashboard, User, MessageSquare,
  FileText, PlusSquare, Search, Bell, Zap, Settings, Shield, X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import AIChatbot from '../chat/AIChatbot'
import api from '../../utils/api'
import { getInitials, timeAgo } from '../../utils/helpers'

export default function MainLayout() {
  const { user: clerkUser } = useUser()
  const { user, isEmployer, hasRole } = useApp()
  const navigate = useNavigate()
  const [chatbotOpen, setChatbotOpen] = useState(false)

  // Global search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data } = await api.get(`/users/search?q=${searchQuery}`)
        setSearchResults(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([])
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Settings Logic
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleDarkMode = () => {
    if (darkMode) document.documentElement.classList.remove('dark')
    else document.documentElement.classList.add('dark')
    setDarkMode(!darkMode)
  }

  // Notifications logic
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length
  const notifRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/users/notifications')
      setNotifications(data)
    } catch (err) { }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 60000) // Poll every min
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleOpenNotifications = async () => {
    setShowNotifications(v => !v)
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.put('/users/notifications/read')
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch (err) {}
    }
  }

  // Redirect to role select if no role chosen yet
  if (!hasRole && user) {
    navigate('/select-role', { replace: true })
    return null
  }

  const navItems = [
    { to: '/feed',           icon: Home,           label: 'Feed' },
    { to: '/jobs',           icon: Briefcase,      label: 'Jobs' },
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat',           icon: MessageSquare,  label: 'Messages' },
    { to: '/resume-builder', icon: FileText,       label: 'Resume',    hidden: isEmployer },
    { to: '/jobs/post',      icon: PlusSquare,     label: 'Post Job',  hidden: !isEmployer },
    { to: '/profile',        icon: User,           label: 'Profile' },
  ].filter(n => !n.hidden)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => navigate('/feed')} className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-brand-700 text-lg hidden sm:block">SkillConnect</span>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-sm hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9 py-1.5 text-sm"
                placeholder="Search jobs, people…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => { if (searchQuery) setSearchQuery(e.target.value + ' ') }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/jobs?search=${e.target.value.trim()}`)
                    setSearchResults([])
                  }
                }}
              />
              
              {/* Live search dropdown results */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-slate-400">Searching people...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">No users found</div>
                  ) : (
                    searchResults.map(u => (
                      <button
                        key={u._id}
                        onClick={() => {
                          navigate(`/profile/${u._id}`);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                      >
                       <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-xs flex-shrink-0 overflow-hidden">
                         {u.profilePhoto ? <img src={u.profilePhoto} className="w-full h-full object-cover"/> : getInitials(u.firstName, u.lastName)}
                       </div>
                       <div className="min-w-0 flex-1">
                         <div className="text-sm font-medium text-slate-800 truncate">{u.firstName} {u.lastName}</div>
                         <div className="text-xs text-slate-400 truncate">{u.headline || u.role}</div>
                       </div>
                      </button>
                    ))
                  )}
                  <button 
                    onClick={() => { navigate(`/jobs?search=${searchQuery.trim()}`); setSearchResults([]); }}
                    className="w-full p-3 text-sm text-brand-600 hover:bg-brand-50 font-medium text-center border-t border-slate-100 transition-colors"
                  >
                    Search jobs for "{searchQuery.trim()}"
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5
                   ${isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative" ref={notifRef}>
              <button 
                onClick={handleOpenNotifications}
                className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100 font-semibold text-slate-800 flex justify-between items-center bg-slate-50/50">
                    Notifications
                    {unreadCount > 0 && <span className="badge badge-brand text-[10px] py-0.5">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <div className="text-slate-400 text-sm">No notifications yet</div>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 flex items-start gap-3 transition-colors ${!n.read ? 'bg-brand-50/20' : ''}`}>
                          <div 
                            className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm flex-shrink-0 overflow-hidden cursor-pointer shadow-sm border border-brand-50" 
                            onClick={() => { setShowNotifications(false); navigate(`/profile/${n.triggerUser?._id}`); }}
                          >
                            {n.triggerUser?.profilePhoto ? <img src={n.triggerUser.profilePhoto} className="w-full h-full object-cover"/> : getInitials(n.triggerUser?.firstName, n.triggerUser?.lastName)}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="text-sm text-slate-700 leading-tight">
                              <span 
                                className="font-semibold text-slate-900 cursor-pointer hover:underline" 
                                onClick={() => { setShowNotifications(false); navigate(`/profile/${n.triggerUser?._id}`); }}
                              >
                                {n.triggerUser?.firstName} {n.triggerUser?.lastName}
                              </span>
                              {n.action === 'like' && " liked your post."}
                              {n.action === 'comment' && " commented on your post."}
                              {n.action === 'view' && " viewed your profile."}
                            </div>
                            {n.text && <div className="text-[13px] text-slate-500 truncate mt-1 bg-white border border-slate-100 px-2 py-1 rounded-lg">"{n.text}"</div>}
                            <div className="text-[11px] text-slate-400 mt-1 font-medium">{timeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 flex justify-around py-2">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center px-2 py-1 rounded-lg text-xs gap-0.5
               ${isActive ? 'text-brand-600' : 'text-slate-400'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── AI Chatbot Fab ─────────────────────────────────── */}
      <button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 bg-brand-600
                   text-white rounded-full shadow-lg hover:bg-brand-700 flex items-center
                   justify-center transition-colors"
        title="AI Career Assistant"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {chatbotOpen && <AIChatbot onClose={() => setChatbotOpen(false)} />}

      {/* ── Settings Modal ─────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm animate-slide-up overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-600" /> Platform Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 text-sm">Theme Appearance</div>
                  <div className="text-xs text-slate-500">Toggle dark or light app mode</div>
                </div>
                <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-brand-600' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
