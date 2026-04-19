import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Zap, Briefcase, Users, FileText, Star, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  const features = [
    { icon: Briefcase, title: 'Smart Job Matching',       desc: 'AI-powered job recommendations tailored to your skills and experience.' },
    { icon: FileText,  title: 'Resume Builder & Analyzer', desc: 'Build beautiful resumes and get instant AI feedback to improve your score.' },
    { icon: Users,     title: 'Professional Network',      desc: 'Connect with employers and professionals in your industry.' },
    { icon: Zap,       title: 'Real-time Chat',            desc: 'Communicate directly with employers or candidates instantly.' },
  ]

  const stats = [
    { value: '50K+', label: 'Active Jobs' },
    { value: '200K+', label: 'Professionals' },
    { value: '10K+', label: 'Companies' },
    { value: '95%', label: 'Success Rate' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-brand-700 text-xl">SkillConnect</span>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <button onClick={() => navigate('/feed')} className="btn-primary">
                Go to App <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/sign-in')} className="btn-ghost">Sign In</button>
                <button onClick={() => navigate('/sign-up')} className="btn-primary">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-300/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
            <Star className="w-3.5 h-3.5 text-yellow-300" />
            The #1 Professional Network for Jobs & Talent
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Your Career,<br />
            <span className="text-brand-300">Supercharged.</span>
          </h1>

          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            SkillConnect bridges the gap between top talent and great companies. 
            Whether you're hiring or job hunting — we make it seamless.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/sign-up')}
              className="px-8 py-3.5 bg-white text-brand-700 font-bold rounded-xl
                         hover:bg-brand-50 transition-colors text-base shadow-lg"
            >
              Find Your Dream Job →
            </button>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl
                         hover:bg-white/10 transition-colors text-base"
            >
              Post a Job Opening
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-black/20 border-t border-white/10 py-8">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="font-display text-3xl font-extrabold text-white">{value}</div>
                <div className="text-brand-200 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Powerful tools for both job seekers and employers, all in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-20 bg-brand-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Join thousands of professionals and companies already on SkillConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {['Free to join', 'No credit card required', 'Set up in minutes'].map(f => (
              <div key={f} className="flex items-center gap-2 text-brand-100">
                <CheckCircle className="w-4 h-4 text-brand-300" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/sign-up')}
            className="mt-8 px-10 py-4 bg-white text-brand-700 font-bold rounded-xl
                       hover:bg-brand-50 transition-colors text-base shadow-lg"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© 2024 SkillConnect. Built with the MERN stack.</p>
      </footer>
    </div>
  )
}
