import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

// Context
import { AppProvider } from './context/AppContext'

// Pages
import LandingPage      from './pages/LandingPage'
import SignInPage       from './pages/SignInPage'
import SignUpPage       from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RoleSelectPage   from './pages/RoleSelectPage'
import FeedPage         from './pages/FeedPage'
import JobsPage         from './pages/JobsPage'
import JobDetailPage    from './pages/JobDetailPage'
import DashboardPage    from './pages/DashboardPage'
import ProfilePage      from './pages/ProfilePage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import ChatPage         from './pages/ChatPage'
import PostJobPage      from './pages/PostJobPage'
import NotFoundPage     from './pages/NotFoundPage'

// Layout
import MainLayout from './components/layout/MainLayout'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return children
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">Loading SkillConnect…</p>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Role selection — after first login */}
        <Route path="/select-role" element={
          <ProtectedRoute><RoleSelectPage /></ProtectedRoute>
        } />

        {/* Protected routes inside MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/feed"            element={<FeedPage />} />
          <Route path="/jobs"            element={<JobsPage />} />
          <Route path="/jobs/:id"        element={<JobDetailPage />} />
          <Route path="/jobs/post"       element={<PostJobPage />} />
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/profile"         element={<ProfilePage />} />
          <Route path="/profile/:id"     element={<ProfilePage />} />
          <Route path="/resume-builder"  element={<ResumeBuilderPage />} />
          <Route path="/chat"            element={<ChatPage />} />
          <Route path="/chat/:userId"    element={<ChatPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProvider>
  )
}
