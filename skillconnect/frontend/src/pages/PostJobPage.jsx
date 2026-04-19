import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X } from 'lucide-react'

const COMMON_SKILLS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker',
  'PostgreSQL', 'MongoDB', 'GraphQL', 'Vue.js', 'Angular', 'Java', 'Go', 'Rust']

export default function PostJobPage() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    company: user?.companyName || '',
    industry: user?.industry || '',
    location: '',
    workType: 'onsite',
    jobType: 'full-time',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    showSalary: true,
    skills: [],
    experienceLevel: 'mid',
    experienceYears: '',
    deadline: '',
  })

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (!trimmed || form.skills.includes(trimmed)) return
    set('skills', [...form.skills, trimmed])
    setSkillInput('')
  }

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.location || !form.company) {
      return toast.error('Please fill in all required fields')
    }
    setLoading(true)
    try {
      const { data } = await api.post('/jobs', form)
      toast.success('Job posted successfully! 🎉')
      navigate(`/jobs/${data._id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'input'
  const sectionClass = 'card p-6 space-y-4'

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-slate-500 mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className={sectionClass}>
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Basic Information</h2>

          <div>
            <label className="label">Job Title <span className="text-red-500">*</span></label>
            <input className={inputClass} placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company <span className="text-red-500">*</span></label>
              <input className={inputClass} value={form.company} onChange={e => set('company', e.target.value)} required />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className={inputClass} placeholder="e.g. Technology" value={form.industry} onChange={e => set('industry', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="e.g. San Francisco, CA" value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>
            <div>
              <label className="label">Work Type</label>
              <select className={inputClass} value={form.workType} onChange={e => set('workType', e.target.value)}>
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job Type</label>
              <select className={inputClass} value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select className={inputClass} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className={sectionClass}>
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Compensation</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Min Salary</label>
              <input type="number" className={inputClass} placeholder="50000" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} />
            </div>
            <div>
              <label className="label">Max Salary</label>
              <input type="number" className={inputClass} placeholder="80000" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} />
            </div>
            <div>
              <label className="label">Period</label>
              <select className={inputClass} value={form.salaryPeriod} onChange={e => set('salaryPeriod', e.target.value)}>
                <option value="yearly">Per Year</option>
                <option value="monthly">Per Month</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input type="checkbox" checked={form.showSalary} onChange={e => set('showSalary', e.target.checked)} className="accent-brand-600" />
            Show salary range publicly
          </label>
        </div>

        {/* Description */}
        <div className={sectionClass}>
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Job Details</h2>
          <div>
            <label className="label">Job Description <span className="text-red-500">*</span></label>
            <textarea
              className="textarea min-h-[160px]"
              placeholder="Describe the role, team, and what you're looking for…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Requirements</label>
            <textarea className="textarea min-h-[120px]" placeholder="• 3+ years of React experience&#10;• Bachelor's degree in CS or equivalent&#10;• Strong communication skills" value={form.requirements} onChange={e => set('requirements', e.target.value)} />
          </div>
          <div>
            <label className="label">Responsibilities</label>
            <textarea className="textarea min-h-[120px]" placeholder="• Build and maintain frontend components&#10;• Collaborate with design team&#10;• Code reviews" value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} />
          </div>
        </div>

        {/* Skills */}
        <div className={sectionClass}>
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Required Skills</h2>
          <div className="flex gap-2">
            <input
              className={`${inputClass} flex-1`}
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
            />
            <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
              <button key={s} type="button" onClick={() => addSkill(s)} className="badge badge-slate hover:bg-brand-50 hover:text-brand-700 cursor-pointer transition-colors">
                + {s}
              </button>
            ))}
          </div>

          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => (
                <span key={s} className="badge badge-blue flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className={sectionClass}>
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Application Deadline</h2>
          <input type="date" className={`${inputClass} max-w-xs`} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? 'Publishing…' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
