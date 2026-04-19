import { SignUp } from '@clerk/clerk-react'
import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-700 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-600" />
        </div>
        <span className="font-display font-bold text-white text-2xl">SkillConnect</span>
      </Link>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/select-role"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-modal rounded-2xl border-0',
            headerTitle: 'font-display font-bold',
            formButtonPrimary: 'bg-brand-600 hover:bg-brand-700',
          },
        }}
      />
    </div>
  )
}
