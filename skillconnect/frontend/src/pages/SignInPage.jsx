// pages/SignInPage.jsx
import { SignIn } from '@clerk/clerk-react'
import { Zap, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-700 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-600" />
        </div>
        <span className="font-display font-bold text-white text-2xl">SkillConnect</span>
      </Link>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/feed"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-modal rounded-2xl border-0',
            headerTitle: 'font-display font-bold',
            formButtonPrimary: 'bg-brand-600 hover:bg-brand-700',
          },
        }}
      />
      <div className="mt-6 text-center animate-fade-in">
        <Link to="/forgot-password" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-600 font-medium hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all cursor-pointer">
           <KeyRound className="w-4 h-4" />
           Forgot your password? Reset it here
        </Link>
      </div>
    </div>
  )
}
