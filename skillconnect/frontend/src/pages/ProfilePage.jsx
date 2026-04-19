import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  Edit3, MapPin, Globe, Github, Linkedin, Save, X, Plus, Trash2,
  Briefcase, GraduationCap, Code, Upload, Building2, Camera
} from 'lucide-react'
import { getInitials, formatDate } from '../utils/helpers'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser, fetchUser, isEmployer } = useApp()
  const navigate = useNavigate()

  const isOwnProfile = !id || id === currentUser?._id
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwnProfile) {
          setProfile(currentUser)
          setForm(currentUser || {})
        } else {
          const { data } = await api.get(`/users/${id}`)
          setProfile(data)
        }
      } catch (err) {
        toast.error('Could not load profile')
      } finally {
        setLoading(false)
      }
    }
    if (currentUser || id) load()
  }, [id, currentUser])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/me', form)
      await fetchUser()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const { data } = await api.put('/users/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(p => ({ ...p, profilePhoto: data.profilePhoto }))
      await fetchUser()
      toast.success('Photo updated!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const { data } = await api.put('/users/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await fetchUser()
      toast.success('Resume uploaded!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-xl" />
      <div className="h-32 bg-slate-200 rounded-xl" />
    </div>
  )

  const p = isOwnProfile && editing ? form : profile
  if (!p) return <div className="text-center p-12 text-slate-400">Profile not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-700 to-brand-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative">
              {p.profilePhoto ? (
                <img src={p.profilePhoto} alt="" className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-brand-100 flex items-center justify-center text-brand-600 font-display text-2xl font-bold shadow-lg">
                  {getInitials(p.firstName, p.lastName)}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 border-2 border-white" title="Change Photo">
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  {p.profilePhoto && (
                    <button 
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to remove your profile photo?")) {
                          try {
                            await api.delete('/users/photo')
                            setProfile(prev => ({ ...prev, profilePhoto: '' }))
                            toast.success("Photo removed")
                            fetchUser()
                          } catch (err) { toast.error("Failed to remove photo") }
                        }
                      }}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 border-2 border-white" title="Remove Photo">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="btn-ghost"><X className="w-4 h-4" /></button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                      <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-secondary">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input className="input" value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Headline</label>
                <input className="input" placeholder="e.g. Senior React Developer | Open to work" value={form.headline || ''} onChange={e => set('headline', e.target.value)} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="e.g. San Francisco, CA" value={form.location || ''} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label className="label">About</label>
                <textarea className="textarea min-h-[100px]" placeholder="Tell your story…" value={form.about || ''} onChange={e => set('about', e.target.value)} />
              </div>

              {/* Employer fields */}
              {isEmployer && (
                <>
                  <div><label className="label">Company Name</label><input className="input" value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} /></div>
                  <div><label className="label">Company Website</label><input className="input" value={form.companyWebsite || ''} onChange={e => set('companyWebsite', e.target.value)} /></div>
                  <div><label className="label">Company Description</label><textarea className="textarea" value={form.companyDescription || ''} onChange={e => set('companyDescription', e.target.value)} /></div>
                </>
              )}

              {/* Social links */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">LinkedIn URL</label><input className="input" value={form.linkedinUrl || ''} onChange={e => set('linkedinUrl', e.target.value)} /></div>
                <div><label className="label">GitHub URL</label><input className="input" value={form.githubUrl || ''} onChange={e => set('githubUrl', e.target.value)} /></div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">{p.firstName} {p.lastName}</h1>
              {p.headline && <p className="text-slate-600 mt-1">{p.headline}</p>}
              {p.location && (
                <div className="flex items-center gap-1 text-slate-400 text-sm mt-2">
                  <MapPin className="w-3.5 h-3.5" />{p.location}
                </div>
              )}
              {p.about && <p className="text-slate-600 text-sm mt-4 leading-relaxed">{p.about}</p>}

              {/* Social links */}
              <div className="flex gap-3 mt-4">
                {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700"><Linkedin className="w-5 h-5" /></a>}
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800"><Github className="w-5 h-5" /></a>}
                {p.portfolioUrl && <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800"><Globe className="w-5 h-5" /></a>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume section (job seeker only) */}
      {!isEmployer && isOwnProfile && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Resume</h2>
            <label className="btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" /> Upload PDF
              <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
            </label>
          </div>
          {profile?.resumeUrl ? (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-sm flex items-center gap-1">
              📄 View uploaded resume
            </a>
          ) : (
            <p className="text-sm text-slate-400">No resume uploaded yet. Upload a PDF or use the Resume Builder.</p>
          )}
        </div>
      )}

      {/* Skills */}
      {!isEmployer && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Skills</h2>
          {editing ? (
            <div>
              <input
                className="input mb-2"
                placeholder="Add skills separated by commas"
                defaultValue={form.skills?.join(', ') || ''}
                onBlur={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.skills?.length > 0
                ? p.skills.map(s => <span key={s} className="badge badge-blue">{s}</span>)
                : <span className="text-slate-400 text-sm">No skills listed</span>
              }
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {!isEmployer && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Experience
          </h2>
          {(p.experience?.length === 0 || !p.experience) ? (
            <p className="text-slate-400 text-sm">No experience listed</p>
          ) : (
            <div className="space-y-4">
              {p.experience?.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{exp.title}</div>
                    <div className="text-sm text-slate-600">{exp.company}</div>
                    <div className="text-xs text-slate-400">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </div>
                    {exp.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Education */}
      {!isEmployer && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Education
          </h2>
          {(p.education?.length === 0 || !p.education) ? (
            <p className="text-slate-400 text-sm">No education listed</p>
          ) : (
            <div className="space-y-4">
              {p.education?.map((edu, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{edu.school}</div>
                    <div className="text-sm text-slate-600">{edu.degree} in {edu.field}</div>
                    <div className="text-xs text-slate-400">
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employer: Company info */}
      {isEmployer && profile?.companyName && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Company
          </h2>
          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-800 text-lg">{p.companyName}</div>
            {p.industry && <div className="text-slate-500">{p.industry}</div>}
            {p.companyDescription && <p className="text-slate-600 leading-relaxed">{p.companyDescription}</p>}
            {p.companyWebsite && (
              <a href={p.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />{p.companyWebsite}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Switch role */}
      {isOwnProfile && (
        <div className="card p-5 border-dashed border-2 border-slate-200 bg-slate-50">
          <h3 className="font-medium text-slate-600 mb-2">Switch Role</h3>
          <p className="text-sm text-slate-400 mb-3">
            Currently: <strong className="text-slate-600 capitalize">{profile?.role?.replace('_', ' ')}</strong>
          </p>
          <button
            onClick={() => navigate('/select-role')}
            className="btn-ghost text-sm"
          >
            Switch to {profile?.role === 'employer' ? 'Job Seeker' : 'Employer'} →
          </button>
        </div>
      )}
    </div>
  )
}
