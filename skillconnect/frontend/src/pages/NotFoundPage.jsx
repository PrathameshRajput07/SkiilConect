import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="font-display text-9xl font-extrabold text-slate-200">404</div>
      <h1 className="font-display text-2xl font-bold text-slate-700 mt-4">Page not found</h1>
      <p className="text-slate-400 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button onClick={() => navigate('/feed')} className="btn-primary">
          <Home className="w-4 h-4" /> Home Feed
        </button>
      </div>
    </div>
  )
}
