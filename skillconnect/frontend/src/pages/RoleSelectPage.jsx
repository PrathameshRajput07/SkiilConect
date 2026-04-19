import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Briefcase, Search, ArrowRight, Zap } from 'lucide-react'

export default function RoleSelectPage() {
  const { fetchUser } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return toast.error('Please select a role to continue')
    setLoading(true)
    try {
      await api.put('/users/role', { role: selected })
      await fetchUser()
      toast.success(`Welcome! You're set up as a ${selected === 'employer' ? 'Employer' : 'Job Seeker'}.`)
      navigate('/feed', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      id: 'job_seeker',
      icon: Search,
      title: 'I want to find a job',
      subtitle: 'Browse thousands of openings, build your resume, and apply with one click.',
      color: 'brand',
    },
    {
      id: 'employer',
      icon: Briefcase,
      title: 'I want to hire talent',
      subtitle: 'Post job listings, review applicants, and connect with top professionals.',
      color: 'brand',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-700 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-600" />
        </div>
        <span className="font-display font-bold text-white text-2xl">SkillConnect</span>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal p-8 animate-slide-up">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2 text-center">
          How are you using SkillConnect?
        </h1>
        <p className="text-slate-500 text-center mb-8 text-sm">
          Choose your role — you can switch it later in Settings.
        </p>

        <div className="grid gap-4 mb-8">
          {roles.map(({ id, icon: Icon, title, subtitle }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4
                ${selected === id
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                ${selected === id ? 'bg-brand-600' : 'bg-slate-100'}`}>
                <Icon className={`w-6 h-6 ${selected === id ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div>
                <div className="font-semibold text-slate-800 mb-1">{title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{subtitle}</div>
              </div>
              {/* Radio indicator */}
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
                ${selected === id ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                {selected === id && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {loading ? 'Setting up your account…' : 'Continue'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
