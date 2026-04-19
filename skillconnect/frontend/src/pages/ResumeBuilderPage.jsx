import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Download, Eye, Sparkles, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

// ── Resume templates ──────────────────────────────────────────

function ModernTemplate({ data }) {
  const { name, email, phone, location, linkedin, summary, experience, education, skills, projects } = data
  return (
    <div id="resume-preview" className="bg-white text-slate-800 p-10 min-h-[297mm] font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="border-b-4 border-brand-600 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs mt-2">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {linkedin && <span>{linkedin}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2 className="text-brand-700 font-bold uppercase text-xs tracking-widest mb-2">Summary</h2>
          <p className="text-slate-600">{summary}</p>
        </div>
      )}

      {skills?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-brand-700 font-bold uppercase text-xs tracking-widest mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded text-xs font-medium">{s}</span>
            ))}
          </div>
        </div>
      )}

      {experience?.filter(e => e.title).length > 0 && (
        <div className="mb-5">
          <h2 className="text-brand-700 font-bold uppercase text-xs tracking-widest mb-3">Experience</h2>
          <div className="space-y-4">
            {experience.filter(e => e.title).map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <div className="font-semibold">{exp.title}</div>
                  <div className="text-slate-400 text-xs">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
                </div>
                <div className="text-brand-600 font-medium text-xs">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description && <p className="text-slate-600 mt-1 text-xs">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {education?.filter(e => e.school).length > 0 && (
        <div className="mb-5">
          <h2 className="text-brand-700 font-bold uppercase text-xs tracking-widest mb-3">Education</h2>
          <div className="space-y-3">
            {education.filter(e => e.school).map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <div className="font-semibold">{edu.school}</div>
                  <div className="text-slate-400 text-xs">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="text-xs text-slate-500">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects?.filter(p => p.title).length > 0 && (
        <div>
          <h2 className="text-brand-700 font-bold uppercase text-xs tracking-widest mb-3">Projects</h2>
          <div className="space-y-3">
            {projects.filter(p => p.title).map((proj, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{proj.title}</div>
                  {proj.link && <a href={proj.link} className="text-brand-500 text-xs">↗ Link</a>}
                </div>
                {proj.description && <p className="text-slate-600 text-xs mt-0.5">{proj.description}</p>}
                {proj.techStack?.length > 0 && (
                  <div className="text-xs text-slate-400 mt-0.5">{typeof proj.techStack === 'string' ? proj.techStack : proj.techStack.join(' · ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ClassicTemplate({ data }) {
  const { name, email, phone, location, summary, experience, education, skills, projects } = data
  return (
    <div id="resume-preview" className="bg-white text-slate-800 p-10 min-h-[297mm] font-serif text-sm">
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide">{name || 'Your Name'}</h1>
        <div className="text-xs text-slate-500 mt-1 flex justify-center gap-3 flex-wrap">
          {[email, phone, location].filter(Boolean).join(' | ')}
        </div>
      </div>
      {summary && (<div className="mb-5"><h2 className="font-bold uppercase text-xs tracking-widest border-b border-slate-300 pb-1 mb-2">Professional Summary</h2><p className="text-slate-600 text-xs">{summary}</p></div>)}
      {experience?.filter(e => e.title).length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-xs tracking-widest border-b border-slate-300 pb-1 mb-3">Work Experience</h2>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between"><span className="font-bold">{exp.title}</span><span className="text-xs text-slate-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="italic text-xs text-slate-600">{exp.company}</div>
              {exp.description && <p className="text-xs mt-1 text-slate-600">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {education?.filter(e => e.school).length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-xs tracking-widest border-b border-slate-300 pb-1 mb-3">Education</h2>
          {education.filter(e => e.school).map((edu, i) => (
            <div key={i} className="mb-2"><div className="flex justify-between"><span className="font-bold">{edu.school}</span><span className="text-xs">{edu.startDate} – {edu.endDate}</span></div><div className="italic text-xs text-slate-500">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div></div>
          ))}
        </div>
      )}
      {skills?.length > 0 && (<div><h2 className="font-bold uppercase text-xs tracking-widest border-b border-slate-300 pb-1 mb-2">Skills</h2><p className="text-xs text-slate-600">{skills.join(' • ')}</p></div>)}
    </div>
  )
}

function MinimalTemplate({ data }) {
  const { name, email, phone, location, summary, experience, education, skills, projects } = data
  return (
    <div id="resume-preview" className="bg-white text-slate-800 p-10 min-h-[297mm] font-sans text-sm">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-slate-900 tracking-tight">{name || 'Your Name'}</h1>
        <div className="text-xs text-slate-400 mt-2 space-x-3">{[email, phone, location].filter(Boolean).join('  ·  ')}</div>
      </div>
      {summary && <p className="text-slate-500 text-xs mb-8 max-w-lg leading-relaxed">{summary}</p>}
      {experience?.filter(e => e.title).length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Experience</div>
          {experience.filter(e => e.title).map((exp, i) => (
            <div key={i} className="mb-4 grid grid-cols-4 gap-4">
              <div className="text-xs text-slate-400 col-span-1 pt-0.5">{exp.startDate}<br/>{exp.current ? 'Present' : exp.endDate}</div>
              <div className="col-span-3"><div className="font-medium">{exp.title} — <span className="font-normal text-slate-500">{exp.company}</span></div>{exp.description && <p className="text-xs text-slate-500 mt-1">{exp.description}</p>}</div>
            </div>
          ))}
        </div>
      )}
      {education?.filter(e => e.school).length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Education</div>
          {education.filter(e => e.school).map((edu, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 mb-3"><div className="text-xs text-slate-400 col-span-1">{edu.startDate}<br/>{edu.endDate}</div><div className="col-span-3"><div className="font-medium">{edu.school}</div><div className="text-xs text-slate-500">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</div></div></div>
          ))}
        </div>
      )}
      {skills?.length > 0 && (<div><div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Skills</div><div className="flex flex-wrap gap-3 text-xs text-slate-600">{skills.map((s, i) => <span key={i}>{s}</span>)}</div></div>)}
    </div>
  )
}

// ── Analyzer ──────────────────────────────────────────────────
function ResumeAnalyzer({ data }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = () => {
    setLoading(true)
    setTimeout(() => {
      const hasName = !!data.name
      const hasSummary = !!(data.summary && data.summary.length > 50)
      const hasExp = (data.experience?.filter(e => e.title).length || 0) > 0
      const hasEdu = (data.education?.filter(e => e.school).length || 0) > 0
      const hasSkills = (data.skills?.length || 0) >= 3
      const hasProjects = (data.projects?.filter(p => p.title).length || 0) > 0
      const hasContact = !!(data.email && data.phone)
      const skillCount = data.skills?.length || 0

      let score = 0
      if (hasName) score += 10
      if (hasSummary) score += 20
      if (hasExp) score += 25
      if (hasEdu) score += 15
      if (hasSkills) score += 15
      if (hasProjects) score += 10
      if (hasContact) score += 5

      const tips = []
      if (!hasSummary) tips.push({ type: 'error', text: 'Add a professional summary (at least 50 characters)' })
      if (!hasExp) tips.push({ type: 'error', text: 'Add at least one work experience entry' })
      if (skillCount < 5) tips.push({ type: 'warning', text: `Add more skills — you have ${skillCount}, aim for 8-12` })
      if (!hasProjects) tips.push({ type: 'warning', text: 'Add projects to showcase your work' })
      if (score >= 80) tips.push({ type: 'success', text: 'Great resume! Make sure to tailor it for each job.' })

      setResult({ score, tips })
      setLoading(false)
    }, 1200)
  }

  const scoreColor = result?.score >= 80 ? 'text-green-600' : result?.score >= 60 ? 'text-orange-500' : 'text-red-500'
  const barColor   = result?.score >= 80 ? 'bg-green-500' : result?.score >= 60 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-500" />
        <h3 className="font-semibold text-slate-700">Resume Analyzer</h3>
      </div>

      {!result ? (
        <>
          <p className="text-sm text-slate-500 mb-4">Get an instant score and improvement tips based on your resume content.</p>
          <button onClick={analyze} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Analyzing…' : 'Analyze My Resume'}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-5xl font-display font-bold ${scoreColor}`}>{result.score}</div>
            <div className="text-slate-400 text-sm">/ 100</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${result.score}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {result.tips.map((tip, i) => {
              const colors = { error: 'bg-red-50 text-red-700', warning: 'bg-orange-50 text-orange-700', success: 'bg-green-50 text-green-700' }
              return (
                <div key={i} className={`text-xs p-3 rounded-lg ${colors[tip.type]}`}>{tip.text}</div>
              )
            })}
          </div>
          <button onClick={() => setResult(null)} className="btn-ghost w-full justify-center text-sm">Re-analyze</button>
        </div>
      )}
    </div>
  )
}

// ── Main Resume Builder ───────────────────────────────────────
export default function ResumeBuilderPage() {
  const { user } = useApp()
  const previewRef = useRef()
  const [template, setTemplate] = useState('modern')
  const [activeSection, setActiveSection] = useState('contact')

  const emptyExp = () => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })
  const emptyEdu = () => ({ school: '', degree: '', field: '', startDate: '', endDate: '', grade: '' })
  const emptyProj = () => ({ title: '', description: '', techStack: '', link: '' })

  const [data, setData] = useState({
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: '',
    location: user?.location || '',
    linkedin: user?.linkedinUrl || '',
    summary: user?.about || '',
    skills: user?.skills || [],
    experience: user?.experience?.length ? user.experience.map(e => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '',
      endDate:   e.endDate   ? new Date(e.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '',
    })) : [emptyExp()],
    education: user?.education?.length ? user.education.map(e => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '',
      endDate:   e.endDate   ? new Date(e.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '',
    })) : [emptyEdu()],
    projects: user?.projects?.length ? user.projects.map(p => ({ ...p, techStack: p.techStack?.join(', ') || '' })) : [emptyProj()],
  })

  const setField = (field, value) => setData(d => ({ ...d, [field]: value }))

  const updateItem = (section, index, field, value) => {
    setData(d => ({ ...d, [section]: d[section].map((item, i) => i === index ? { ...item, [field]: value } : item) }))
  }

  const addItem = (section, empty) => setData(d => ({ ...d, [section]: [...d[section], empty()] }))
  const removeItem = (section, index) => setData(d => ({ ...d, [section]: d[section].filter((_, i) => i !== index) }))

  const handleDownload = () => {
    toast.success('Select "Save as PDF" in the print dialog')
    const originalTitle = document.title
    document.title = `${data.name || 'Resume'} - SkillConnect`
    
    const previewElement = document.getElementById('resume-preview')
    if (!previewElement) return toast.error('Preview not found')

    // Create a pristine clone appended to the body to escape parent flex/scale/overflow CSS
    const printContainer = document.createElement('div')
    printContainer.id = 'print-container'
    
    const printClone = previewElement.cloneNode(true)
    printContainer.appendChild(printClone)
    document.body.appendChild(printContainer)
    
    // Inject print styles to isolate the wrapper
    const style = document.createElement('style')
    style.innerHTML = `
      @media screen {
        #print-container { display: none !important; }
      }
      @media print {
        body > :not(#print-container) { 
          display: none !important; 
        }
        body {
          background: white !important;
          margin: 0;
          padding: 0;
        }
        #print-container { 
          display: block !important;
          width: 210mm !important; 
          min-height: 297mm !important; 
          margin: 0;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    `
    document.head.appendChild(style)
    
    setTimeout(() => {
      window.print()
      document.body.removeChild(printContainer)
      document.head.removeChild(style)
      document.title = originalTitle
    }, 150)
  }

  const templates = { modern: ModernTemplate, classic: ClassicTemplate, minimal: MinimalTemplate }
  const TemplateComp = templates[template]

  const sections = [
    { id: 'contact', label: 'Contact' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Resume Builder</h1>
          <p className="text-slate-500 mt-1">Build, customize, and download your professional resume</p>
        </div>
        <button onClick={handleDownload} className="btn-primary">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Editor panel ────────────────────── */}
        <div className="space-y-4">
          {/* Template selector */}
          <div className="card p-4">
            <label className="label mb-2">Template Style</label>
            <div className="grid grid-cols-3 gap-3">
              {['modern', 'classic', 'minimal'].map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all
                    ${template === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section tabs */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-thin">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2
                    ${activeSection === s.id ? 'border-brand-600 text-brand-600 bg-brand-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* Contact */}
              {activeSection === 'contact' && (
                <>
                  <div><label className="label">Full Name</label><input className="input" value={data.name} onChange={e => setField('name', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Email</label><input className="input" value={data.email} onChange={e => setField('email', e.target.value)} /></div>
                    <div><label className="label">Phone</label><input className="input" value={data.phone} onChange={e => setField('phone', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Location</label><input className="input" value={data.location} onChange={e => setField('location', e.target.value)} /></div>
                    <div><label className="label">LinkedIn URL</label><input className="input" value={data.linkedin} onChange={e => setField('linkedin', e.target.value)} /></div>
                  </div>
                </>
              )}

              {/* Summary */}
              {activeSection === 'summary' && (
                <div><label className="label">Professional Summary</label><textarea className="textarea min-h-[120px]" value={data.summary} onChange={e => setField('summary', e.target.value)} placeholder="2-3 sentences about who you are and what you bring…" /></div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <>
                  {data.experience.map((exp, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-slate-600 text-sm">Experience #{i + 1}</div>
                        <button onClick={() => removeItem('experience', i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Job Title</label><input className="input" value={exp.title} onChange={e => updateItem('experience', i, 'title', e.target.value)} /></div>
                        <div><label className="label">Company</label><input className="input" value={exp.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} /></div>
                        <div><label className="label">Start Date</label><input className="input" placeholder="Jan 2022" value={exp.startDate} onChange={e => updateItem('experience', i, 'startDate', e.target.value)} /></div>
                        <div><label className="label">End Date</label><input className="input" placeholder="Present" value={exp.endDate} disabled={exp.current} onChange={e => updateItem('experience', i, 'endDate', e.target.value)} /></div>
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={exp.current} onChange={e => updateItem('experience', i, 'current', e.target.checked)} className="accent-brand-600" /><span className="text-slate-600">Currently working here</span></label>
                      <div><label className="label">Description</label><textarea className="textarea min-h-[80px]" value={exp.description} onChange={e => updateItem('experience', i, 'description', e.target.value)} placeholder="• Led a team of 5 engineers…" /></div>
                    </div>
                  ))}
                  <button onClick={() => addItem('experience', emptyExp)} className="btn-secondary w-full justify-center"><Plus className="w-4 h-4" /> Add Experience</button>
                </>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <>
                  {data.education.map((edu, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between"><div className="font-medium text-slate-600 text-sm">Education #{i + 1}</div><button onClick={() => removeItem('education', i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                      <div><label className="label">School / University</label><input className="input" value={edu.school} onChange={e => updateItem('education', i, 'school', e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Degree</label><input className="input" placeholder="Bachelor's" value={edu.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} /></div>
                        <div><label className="label">Field of Study</label><input className="input" placeholder="Computer Science" value={edu.field} onChange={e => updateItem('education', i, 'field', e.target.value)} /></div>
                        <div><label className="label">Start</label><input className="input" placeholder="Sep 2018" value={edu.startDate} onChange={e => updateItem('education', i, 'startDate', e.target.value)} /></div>
                        <div><label className="label">End</label><input className="input" placeholder="Jun 2022" value={edu.endDate} onChange={e => updateItem('education', i, 'endDate', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem('education', emptyEdu)} className="btn-secondary w-full justify-center"><Plus className="w-4 h-4" /> Add Education</button>
                </>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div>
                  <label className="label">Skills (comma separated)</label>
                  <textarea className="textarea min-h-[100px]"
                    value={data.skills.join(', ')}
                    onChange={e => setField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="React, Node.js, TypeScript, AWS, Docker…"
                  />
                  <p className="text-xs text-slate-400 mt-1">Separate each skill with a comma</p>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <>
                  {data.projects.map((proj, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between"><div className="font-medium text-slate-600 text-sm">Project #{i + 1}</div><button onClick={() => removeItem('projects', i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                      <div><label className="label">Project Title</label><input className="input" value={proj.title} onChange={e => updateItem('projects', i, 'title', e.target.value)} /></div>
                      <div><label className="label">Description</label><textarea className="textarea" value={proj.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Tech Stack (comma sep.)</label><input className="input" value={proj.techStack} onChange={e => updateItem('projects', i, 'techStack', e.target.value)} /></div>
                        <div><label className="label">Link</label><input className="input" placeholder="https://github.com/…" value={proj.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem('projects', emptyProj)} className="btn-secondary w-full justify-center"><Plus className="w-4 h-4" /> Add Project</button>
                </>
              )}
            </div>
          </div>

          {/* Analyzer */}
          <ResumeAnalyzer data={data} />
        </div>

        {/* ── Preview panel ────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-600 text-sm">Live Preview</h3>
              <button onClick={handleDownload} className="btn-secondary py-1 text-xs">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg transform scale-[0.65] origin-top-left" style={{ width: '154%' }}>
              <TemplateComp data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
