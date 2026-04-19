import { useState, useRef, useEffect } from 'react'
import api from '../../utils/api'
import { X, Send, Bot, User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const QUICK_PROMPTS = [
  'How do I improve my resume?',
  'Tips for job searching',
  'How to prepare for interviews?',
  'How to negotiate salary?',
]

export default function AIChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **SkillConnect AI**, your career assistant.\n\nI can help you with:\n- **Resume tips** and improvement\n- **Job search** strategies\n- **Interview preparation**\n- **Salary negotiation**\n\nWhat can I help you with today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const { data } = await api.post('/chat', { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again!",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-20 md:bottom-20 right-4 md:right-6 z-50 w-[340px] md:w-[380px] flex flex-col
                    bg-white rounded-2xl shadow-modal border border-slate-100 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-700 to-brand-500 text-white">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">SkillConnect AI</div>
          <div className="text-brand-200 text-xs">Career Assistant · Always online</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 min-h-[300px] max-h-[400px] bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm
              ${msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-br-sm'
                : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-800">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-slate-100 bg-white">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full
                         hover:bg-brand-100 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask me anything about your career…"
          className="input flex-1 text-sm"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn-primary px-3 py-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
