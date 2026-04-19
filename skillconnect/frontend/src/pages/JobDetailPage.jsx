import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  MapPin, Briefcase, Clock, DollarSign, Users, ExternalLink,
  ArrowLeft, Send, X, CheckCircle, Globe, Building2
} from 'lucide-react'
import { formatSalary, timeAgo, formatDate } from '../utils/helpers'

// ── Apply Modal ───────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useApp()
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    try {
      await api.post('/applications', {
        jobId: job._id,
        coverLetter,
        resumeUrl: user?.resumeUrl || '',
      })
      toast.success('Application submitted! 🎉')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-slate-800">Apply to {job.company}</h2>
            <p className="text-sm text-slate-500">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Resume status */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${user?.resumeUrl ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
            <CheckCircle className={`w-5 h-5 ${user?.resumeUrl ? 'text-green-600' : 'text-orange-500'}`} />
            <div>
              <div className="text-sm font-medium text-slate-700">
                {user?.resumeUrl ? 'Resume attached' : 'No resume uploaded'}
              </div>
              <div className="text-xs text-slate-500">
                {user?.resumeUrl
                  ? 'Your uploaded resume will be sent'
                  : 'Upload a resume from your profile for best results'}
              </div>
            </div>
          </div>

          {/* Cover letter */}
          <div>
            <label className="label">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder={`Dear ${job.company} team,\n\nI'm excited to apply for the ${job.title} role…`}
              className="textarea min-h-[140px]"
              maxLength={2000}
            />
            <div className="text-xs text-slate-400 text-right mt-1">{coverLetter.length}/2000</div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleApply} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Submitting…' : 'Submit Application'}
            {!loading && <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Job Detail ────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isJobSeeker } = useApp()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`)
        setJob(data)
      } catch (err) {
        toast.error(err.message)
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/2" />
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  )

  if (!job) return null

  const workTypeColor = { remote: 'badge-green', onsite: 'badge-blue', hybrid: 'badge-orange' }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate('/jobs')} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Main content ──────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-5">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-xl object-contain border border-slate-100 p-1" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
                  <Building2 className="w-7 h-7 text-brand-500" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">{job.title}</h1>
                <div className="text-slate-600 font-medium">{job.company}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />{job.location}
                  </span>
                  <span className={`badge ${workTypeColor[job.workType] || 'badge-slate'}`}>{job.workType}</span>
                  <span className="badge badge-slate">{job.jobType}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100">
              <div>
                <div className="text-xs text-slate-400 mb-1">Salary</div>
                <div className="font-semibold text-slate-700 text-sm">
                  {job.showSalary ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod) : 'Hidden'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Experience</div>
                <div className="font-semibold text-slate-700 text-sm capitalize">{job.experienceLevel}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Posted</div>
                <div className="font-semibold text-slate-700 text-sm">{timeAgo(job.createdAt)}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              {isJobSeeker && !applied && (
                <button onClick={() => setShowModal(true)} className="btn-primary flex-1 justify-center py-2.5">
                  <Send className="w-4 h-4" /> Apply Now
                </button>
              )}
              {applied && (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm flex-1 justify-center py-2.5 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4" /> Application Submitted
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {job.requirements && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Requirements</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
            </div>
          )}

          {job.responsibilities && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Responsibilities</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</div>
            </div>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────── */}
        <div className="space-y-4">
          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Company info */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3">About the Company</h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-slate-800">{job.company}</div>
              {job.industry && <div className="text-slate-500">{job.industry}</div>}
              {job.employer?.companyDescription && (
                <p className="text-slate-600 leading-relaxed">{job.employer.companyDescription}</p>
              )}
              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-medium mt-2"
                >
                  <Globe className="w-3.5 h-3.5" /> Visit website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Job stats */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3">Job Overview</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Applications</span>
                <span className="font-medium text-slate-700">{job.applicationCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Views</span>
                <span className="font-medium text-slate-700">{job.views || 0}</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-medium text-slate-700">{formatDate(job.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => setApplied(true)}
        />
      )}
    </div>
  )
}
