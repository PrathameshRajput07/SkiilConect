import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Search, MapPin, Briefcase, SlidersHorizontal, X, ChevronRight, Clock, DollarSign } from 'lucide-react'
import { formatSalary, timeAgo, debounce } from '../utils/helpers'

// ── Job card ─────────────────────────────────────────────────
function JobCard({ job, onClick }) {
  const workTypeClass = { remote: 'badge-green', onsite: 'badge-blue', hybrid: 'badge-orange' }

  return (
    <div onClick={onClick} className="card-hover p-5">
      <div className="flex items-start gap-4">
        {/* Company logo / placeholder */}
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-xl object-contain border border-slate-100 p-1 flex-shrink-0 bg-white" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100">
            <Briefcase className="w-5 h-5 text-brand-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 leading-tight mb-0.5 truncate">{job.title}</h3>
              <div className="text-sm text-slate-500">{job.company}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
            <span className={`badge ${workTypeClass[job.workType] || 'badge-slate'}`}>
              {job.workType}
            </span>
            <span className="badge badge-slate">{job.jobType}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-sm font-medium text-brand-600">
              {job.showSalary ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod) : 'Salary hidden'}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo(job.createdAt)}
            </div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 4).map(s => (
                <span key={s} className="badge badge-slate text-xs">{s}</span>
              ))}
              {job.skills.length > 4 && (
                <span className="badge badge-slate text-xs">+{job.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Filter sidebar ────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClear }) {
  const workTypes = ['remote', 'onsite', 'hybrid']
  const jobTypes  = ['full-time', 'part-time', 'contract', 'internship', 'freelance']
  const expLevels = ['entry', 'mid', 'senior', 'lead', 'executive']

  return (
    <div className="card p-5 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </h3>
        <button onClick={onClear} className="text-xs text-brand-600 hover:underline">Clear all</button>
      </div>

      {/* Work type */}
      <div>
        <label className="label">Work Type</label>
        <div className="space-y-2">
          {workTypes.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.workType === t}
                onChange={() => setFilters(f => ({ ...f, workType: f.workType === t ? '' : t }))}
                className="accent-brand-600"
              />
              <span className="text-sm text-slate-600 capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job type */}
      <div>
        <label className="label">Job Type</label>
        <div className="space-y-2">
          {jobTypes.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.jobType === t}
                onChange={() => setFilters(f => ({ ...f, jobType: f.jobType === t ? '' : t }))}
                className="accent-brand-600"
              />
              <span className="text-sm text-slate-600 capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience level */}
      <div>
        <label className="label">Experience Level</label>
        <div className="space-y-2">
          {expLevels.map(l => (
            <label key={l} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.experienceLevel === l}
                onChange={() => setFilters(f => ({ ...f, experienceLevel: f.experienceLevel === l ? '' : l }))}
                className="accent-brand-600"
              />
              <span className="text-sm text-slate-600 capitalize">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary range */}
      <div>
        <label className="label">Min Salary (₹/yr)</label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={filters.salaryMin}
          onChange={e => setFilters(f => ({ ...f, salaryMin: e.target.value }))}
          className="input text-sm"
        />
      </div>
    </div>
  )
}

// ── Main jobs page ────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [location, setLocation] = useState('')
  const [filters, setFilters] = useState({
    workType: '', jobType: '', experienceLevel: '', salaryMin: '',
  })

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 10 })
      if (search) params.set('search', search)
      if (location) params.set('location', location)
      if (filters.workType) params.set('workType', filters.workType)
      if (filters.jobType) params.set('jobType', filters.jobType)
      if (filters.experienceLevel) params.set('experienceLevel', filters.experienceLevel)
      if (filters.salaryMin) params.set('salaryMin', filters.salaryMin)

      const { data } = await api.get(`/jobs?${params}`)
      setJobs(p === 1 ? data.jobs : prev => [...prev, ...data.jobs])
      setTotal(data.total)
      setPage(p)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, location, filters])

  // Debounced search
  const debouncedFetch = useCallback(debounce(() => fetchJobs(1), 400), [fetchJobs])

  useEffect(() => { debouncedFetch() }, [search, location, filters])

  const clearFilters = () => {
    setFilters({ workType: '', jobType: '', experienceLevel: '', salaryMin: '' })
    setLocation('')
    setSearch('')
  }

  return (
    <div>
      {/* Search bar */}
      <div className="card p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Job title, keywords, or company…"
              className="input pl-9"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, state, or remote"
              className="input pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-secondary ${showFilters ? 'bg-brand-50 border-brand-300' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Filter sidebar — desktop */}
        <div className={`w-56 flex-shrink-0 hidden lg:block`}>
          <FilterPanel filters={filters} setFilters={setFilters} onClear={clearFilters} />
        </div>

        {/* Jobs list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading ? 'Searching…' : `${total.toLocaleString()} job${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading && jobs.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card p-16 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-600 mb-2">No jobs found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-ghost mt-4 mx-auto">Clear filters</button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                />
              ))}
              {jobs.length < total && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => fetchJobs(page + 1)}
                    className="btn-ghost"
                    disabled={loading}
                  >
                    {loading ? 'Loading…' : 'Load more jobs'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
