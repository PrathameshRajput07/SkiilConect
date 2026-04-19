// pages/ForgotPasswordPage.jsx
import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, KeyRound, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP + New Password

  // Step 1: Send OTP to Email
  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    if (!email) return setError("Please enter your email.")
    
    setLoading(true)
    setError('')
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setStep(2)
      toast.success("Verification code sent to your email!")
    } catch (err) {
      console.error(err)
      setError(err.errors?.[0]?.message || 'Verification failed. Please check the email.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    if (!code) return setError("Please enter the verification code.")
    if (!password) return setError("Please enter a new password.")
    if (password.length < 8) return setError("Password must be at least 8 characters long.")

    setLoading(true)
    setError('')
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      
      if (result.status === 'complete') {
        setActive({ session: result.createdSessionId })
        setSuccessMessage("Password successfully changed!")
        toast.success("Password successfully recovered!")
        setTimeout(() => {
          navigate('/feed')
        }, 2000)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error("Clerk OTP Error:", err)
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid verification code or your new password is too weak.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-slate-800 text-2xl">SkillConnect</span>
      </Link>

      <div className="card w-full max-w-md p-8 animate-slide-up shadow-xl border-t-4 border-t-brand-600">
        <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">
          {step === 1 ? "Forgot Password?" : "Reset Your Password"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {step === 1 
            ? "No problem! Enter your email address and we'll send you an OTP to quickly reset your password."
            : `We sent a 6-digit verification code to ${email}. Enter it below along with your new password.`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-fade-in">
            <span className="block">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {successMessage} Redirecting...
          </div>
        )}

        {!successMessage && (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., example@skillconnect.com"
                      className="input pl-9 py-2.5"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
                <div>
                  <label className="label">Verification Code (OTP)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="input pl-9 py-2.5 text-lg tracking-widest font-medium font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="input pl-9 py-2.5"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link to="/sign-in" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
