import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  Briefcase, Users, Eye, Clock, CheckCircle, XCircle,
  TrendingUp, FileText, Plus, ChevronRight, BarChart3
} from 'lucide-react'
import { timeAgo, formatSalary, statusColor } from '../utils/helpers'

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'brand', trend }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="font-display text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  )
}

// ── Job Seeker Dashboard ──────────────────────────────────────
function JobSeekerDashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/my')
      .then(({ data }) => setApplications(data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:      applications.length,
    pending:    applications.filter(a => a.status === 'pending').length,
    reviewing:  applications.filter(a => ['reviewing', 'shortlisted', 'interview'].includes(a.status)).length,
    offered:    applications.filter(a => a.status === 'offered').length,
    rejected:   applications.filter(a => a.status === 'rejected').length,
  }

  const profileScore = () => {
    let score = 0
    if (user?.firstName)    score += 20
    if (user?.headline)     score += 20
    if (user?.about)        score += 15
    if (user?.skills?.length) score += 15
    if (user?.experience?.length) score += 15
    if (user?.resumeUrl)    score += 15
    return score
  }

  const score = profileScore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your job search overview</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="btn-primary">
          <Briefcase className="w-4 h-4" /> Browse Jobs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}    label="Total Applied"  value={stats.total}    color="brand" />
        <StatCard icon={Clock}       label="Pending"        value={stats.pending}  color="orange" />
        <StatCard icon={TrendingUp}  label="In Progress"    value={stats.reviewing} color="brand" />
        <StatCard icon={CheckCircle} label="Offers"         value={stats.offered}  color="green" />
      </div>

      {/* Profile completion */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">Profile Strength</h3>
          <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
            {score}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-400'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {score < 100 ? 'Complete your profile to get more visibility' : 'Your profile is complete!'}
          </p>
          <button onClick={() => navigate('/profile')} className="btn-ghost text-xs py-1">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Applications list */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">My Applications</h3>
          <span className="badge badge-blue">{stats.total} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No applications yet</p>
            <button onClick={() => navigate('/jobs')} className="btn-primary mt-4 mx-auto">
              Find Jobs
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {applications.map(app => (
              <div key={app._id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{app.job?.title}</div>
                  <div className="text-sm text-slate-500">{app.job?.company} · {app.job?.location}</div>
                  <div className="text-xs text-slate-400 mt-1">{timeAgo(app.createdAt)}</div>
                </div>
                <span className={`badge ${statusColor[app.status] || 'badge-slate'} capitalize`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Employer Dashboard ────────────────────────────────────────
function EmployerDashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jobs/my-jobs')
      .then(({ data }) => setJobs(data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)
  const activeJobs = jobs.filter(j => j.status === 'active').length
  const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0)

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus })
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j))
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {user?.companyName || `${user?.firstName}'s`} Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage your job postings and applicants</p>
        </div>
        <button onClick={() => navigate('/jobs/post')} className="btn-primary">
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}  label="Total Jobs Posted" value={jobs.length}         color="brand" />
        <StatCard icon={CheckCircle} label="Active Jobs"       value={activeJobs}         color="green" />
        <StatCard icon={Users}      label="Total Applicants"  value={totalApplications}  color="orange" />
        <StatCard icon={Eye}        label="Total Views"       value={totalViews}          color="brand" />
      </div>

      {/* Jobs table */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Posted Jobs</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No jobs posted yet</p>
            <button onClick={() => navigate('/jobs/post')} className="btn-primary mt-4 mx-auto">
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map(job => (
              <div key={job._id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{job.title}</div>
                    <div className="text-sm text-slate-500">{job.location} · {job.workType} · {job.jobType}</div>
                    <div className="text-xs text-slate-400 mt-1">{timeAgo(job.createdAt)}</div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center hidden sm:block">
                      <div className="font-semibold text-slate-700">{job.applicationCount || 0}</div>
                      <div className="text-xs text-slate-400">Applicants</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="font-semibold text-slate-700">{job.views || 0}</div>
                      <div className="text-xs text-slate-400">Views</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-slate'}`}>
                      {job.status}
                    </span>
                    <button
                      onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                      className="btn-ghost py-1 px-2"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      className="btn-ghost py-1 px-2 text-xs"
                    >
                      {job.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard export ─────────────────────────────────────
export default function DashboardPage() {
  const { user, isEmployer } = useApp()
  if (!user) return null
  return isEmployer ? <EmployerDashboard /> : <JobSeekerDashboard />
}
