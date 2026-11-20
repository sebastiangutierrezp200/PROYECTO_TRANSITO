import { useState, useEffect, useRef } from 'react'
import { Send, Bot, Loader2, AlertCircle, BookOpen, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatbotWidget() {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const bottomRef = useRef(null)

  // Initialize session and trigger first greeting
  useEffect(() => {
    initChat()
  }, [])

  const initChat = (reset = false) => {
    let currentSession = reset ? null : localStorage.getItem('tramites_session_id')
    if (!currentSession) {
      currentSession = crypto.randomUUID()
      localStorage.setItem('tramites_session_id', currentSession)
    }
    setSessionId(currentSession)
    if (reset) {
      setMessages([])
      setQuickReplies([])
    }
    sendMessage('', currentSession, true)
  }

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, quickReplies])

  const sendMessage = async (text, id = sessionId, isInit = false) => {
    if (!isInit && !text.trim()) return

    if (!isInit) {
      setMessages(prev => [...prev, { role: 'user', content: text }])
      setInput('')
    }
    
    setLoading(true)
    setError(null)
    setQuickReplies([])

    try {
      const res = await api.post('/chatbot/mensaje', {
        sessionId: id,
        message: text,
        user: user ? {
          id: user._id || user.id,
          nombre: user.nombre,
          cedula: user.cedula,
          placa_vehiculo: user.placa_vehiculo
        } : null
      })

      const data = res.data.data
      const newBotMsg = {
        role: 'bot',
        content: data.response,
        showCourseLink: data.action === 'redirect_curso',
        simitData: data.simitData || null
      }
      setMessages(prev => [...prev, newBotMsg])
      setQuickReplies(data.quickReplies || [])
      
    } catch (err) {
      console.error(err)
      setError('No pudimos conectar con el servidor. Por favor, intenta de nuevo.')
      if (isInit) {
        setMessages([{ role: 'bot', content: 'Disculpa, el servicio de diagnóstico virtual no está disponible en este momento.' }])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatCurrency = (val) => `$${Number(val).toLocaleString('es-CO')}`

  return (
    <div className="flex flex-col h-[520px] w-full max-w-md bg-gris-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold font-display leading-tight">MOV-IA Asistente</h3>
            <p className="text-blue-100 text-xs text-opacity-80">Trámites y Consultas 24/7</p>
          </div>
        </div>
        <button
          onClick={() => initChat(true)}
          title="Reiniciar conversación"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F19]">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                : 'bg-white/10 text-white/90 rounded-tl-sm border border-white/5'
            }`} style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}

              {/* SIMIT Mini Cards if present */}
              {msg.simitData?.comparendos && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                  {msg.simitData.comparendos.map((c, ci) => (
                    <div key={ci} className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-blue-300">
                        <span>📋 {c.numero}</span>
                        <span className="text-amber-400">{c.codigo}</span>
                      </div>
                      <p className="text-white/70 text-[11px]">{c.descripcion}</p>
                      <div className="flex justify-between items-center pt-1 text-[11px]">
                        <span className="line-through text-white/40">{formatCurrency(c.valor_original)}</span>
                        <span className="text-emerald-400 font-bold">50% off: {formatCurrency(c.valor_descuento)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional Course Link button (Never auto-redirects!) */}
              {msg.showCourseLink && (
                <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                  <Link
                    to={user ? "/curso" : "/login"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all"
                  >
                    <BookOpen size={14} />
                    {user ? "Ir al Curso Virtual →" : "Iniciar Sesión para el Curso →"}
                  </Link>
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/30 mt-1 mx-1">
              {msg.role === 'user' ? 'Tú' : 'MOV-IA Bot'}
            </span>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center bg-white/5 w-fit p-3 rounded-2xl rounded-tl-sm text-white/50">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="text-xs ml-1 font-medium">MOV-IA está respondiendo...</span>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies Area */}
      <AnimatePresence>
        {quickReplies.length > 0 && !loading && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 20, opacity: 0 }}
            className="p-3 bg-[#0B0F19] border-t border-white/5 flex flex-wrap gap-2 shrink-0 max-h-32 overflow-y-auto"
          >
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qr)}
                className="px-3.5 py-1.5 bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
              >
                {qr}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-gris-900 border-t border-white/10 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Pregunta sobre multas, sedes, curso, plazos..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:bg-white/10 disabled:text-white/30 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  )
}
