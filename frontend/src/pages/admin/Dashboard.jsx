import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, Users as UsersIcon, Award, TrendingUp,
  Activity, ArrowRight, Clock, Building2, CheckCircle,
  XCircle, AlertCircle, RefreshCw, ChevronUp, ChevronDown,
  Wifi, MoreVertical, MapPin, Zap, Eye
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { dia: 'Lun', tramites: 42, aprobados: 35, cursos: 18 },
  { dia: 'Mar', tramites: 58, aprobados: 51, cursos: 24 },
  { dia: 'Mié', tramites: 47, aprobados: 39, cursos: 21 },
  { dia: 'Jue', tramites: 73, aprobados: 65, cursos: 31 },
  { dia: 'Vie', tramites: 89, aprobados: 78, cursos: 44 },
  { dia: 'Sáb', tramites: 31, aprobados: 28, cursos: 12 },
  { dia: 'Dom', tramites: 15, aprobados: 13, cursos: 6 },
]

const MONTHLY_TREND = [
  { mes: 'May', tramites: 312 }, { mes: 'Jun', tramites: 398 },
  { mes: 'Jul', tramites: 445 }, { mes: 'Ago', tramites: 389 },
  { mes: 'Sep', tramites: 521 }, { mes: 'Oct', tramites: 487 },
]

const CHANNELS_DATA = [
  { name: 'Web Portal', value: 214, color: '#22c55e' },
  { name: 'Chatbot IA', value: 178, color: '#3b82f6' },
  { name: 'App Móvil', value: 95, color: '#8b5cf6' },
]

const SEDES_STATUS = [
  { nombre: 'Sede Norte', direccion: 'Av. 3N #50-25', admin: 'Carlos Rincón', tramitesHoy: 34, capacidad: 40, estado: 'activa', pct: 85 },
  { nombre: 'Sede Sur', direccion: 'Cra. 100 #16-22', admin: 'María Pérez', tramitesHoy: 28, capacidad: 40, estado: 'activa', pct: 70 },
  { nombre: 'Sede Centro', direccion: 'Cll. 15 #4-40', admin: 'Andrés López', tramitesHoy: 39, capacidad: 40, estado: 'activa', pct: 97 },
  { nombre: 'Sede Oriente', direccion: 'Av. Las Américas #45', admin: 'Paula Gómez', tramitesHoy: 12, capacidad: 30, estado: 'mantenimiento', pct: 40 },
]

const CITAS_HOY = [
  { id: 'T-2841', ciudadano: 'Santiago García Torres', cedula: '1.006.421.837', hora: '09:00', canal: 'chatbot', estado: 'confirmada', avatar: 'S' },
  { id: 'T-2842', ciudadano: 'Valentina Ríos Castillo', cedula: '1.144.021.953', hora: '09:30', canal: 'web', estado: 'en_curso', avatar: 'V' },
  { id: 'T-2843', ciudadano: 'Miguel Herrera Salcedo', cedula: '79.542.861', hora: '10:00', canal: 'web', estado: 'confirmada', avatar: 'M' },
  { id: 'T-2844', ciudadano: 'Lucía Moreno Prado', cedula: '1.088.741.562', hora: '10:30', canal: 'chatbot', estado: 'pendiente', avatar: 'L' },
  { id: 'T-2845', ciudadano: 'Daniel Castro Vega', cedula: '1.033.902.451', hora: '11:00', canal: 'web', estado: 'confirmada', avatar: 'D' },
]

const ACTIVITY_LOGS = [
  { tipo: 'CURSO_APROBADO', desc: 'Valentina Ríos completó el módulo de Señalización Vial — Puntaje: 94%', tiempo: 'Hace 3 min', color: 'bg-verde-500' },
  { tipo: 'TRÁMITE_INICIADO', desc: 'Nuevo trámite T-2845 asignado a Sede Centro por canal web', tiempo: 'Hace 8 min', color: 'bg-blue-500' },
  { tipo: 'DESCUENTO_APLICADO', desc: 'Descuento del 50% aplicado a comparendo #COL-2024-88127 — Miguel Herrera', tiempo: 'Hace 15 min', color: 'bg-purple-500' },
  { tipo: 'USUARIO_REGISTRADO', desc: 'Nuevo ciudadano: Laura Quintero Jiménez (CC: 1.007.231.452)', tiempo: 'Hace 22 min', color: 'bg-orange-500' },
  { tipo: 'CITA_CANCELADA', desc: 'Turno T-2839 cancelado por el ciudadano (razón: reprogramación)', tiempo: 'Hace 31 min', color: 'bg-red-500' },
  { tipo: 'CERTIFICADO_EMITIDO', desc: 'Certificado digital emitido — Código: CERT-2025-00412', tiempo: 'Hace 47 min', color: 'bg-teal-500' },
]

// ─── ANIMATED COUNTER ──────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (start === end) return
    const step = Math.ceil(end / 60)
    const timer = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(start)
      if (start >= end) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display.toLocaleString('es-CO')}</span>
}

// ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gris-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
        <p className="text-[10px] font-black text-gris-400 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs font-bold">{p.name}: <span className="text-verde-400">{p.value}</span></span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({ label, value, subvalue, icon: Icon, gradient, trend, trendUp, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white border border-gris-200 rounded-3xl p-6 overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full ${gradient} opacity-5`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-3.5 rounded-2xl ${gradient} text-white shadow-lg`}>
            <Icon size={22} />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${trendUp ? 'bg-verde-50 text-verde-700' : 'bg-red-50 text-red-600'}`}>
            {trendUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {trend}
          </div>
        </div>
        <p className="text-[11px] font-black text-gris-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-display font-black text-gris-900">
          <AnimatedNumber value={value} />
        </p>
        {subvalue && <p className="text-xs font-bold text-gris-500 mt-2">{subvalue}</p>}
      </div>
    </motion.div>
  )
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState('semana')

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const enCurso = CITAS_HOY.filter(c => c.estado === 'en_curso').length

  return (
    <div className="space-y-8 pb-12">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-display font-extrabold text-gris-900 tracking-tight">
            Hola, {user?.nombre?.split(' ')[0] || 'Administrador'} 👋
          </h2>
          <p className="text-gris-500 font-medium mt-1">
            {user?.rol === 'super_admin'
              ? 'Vista global · Todas las sedes · Sistema en línea'
              : `Gestionando la sede ${user?.sede?.nombre || 'asignada'} · Sistema en línea`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-gris-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-2 h-2 bg-verde-500 rounded-full animate-pulse" />
            <div>
              <p className="text-[9px] font-black text-gris-400 uppercase tracking-widest">Sistema en vivo</p>
              <p className="text-sm font-black text-gris-900 tabular-nums">
                {now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-3.5 bg-white border border-gris-200 rounded-2xl text-gris-500 hover:text-verde-600 hover:border-verde-300 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* ── LIVE STATUS BAR ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gris-900 rounded-3xl px-6 py-4 flex flex-wrap items-center gap-6 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <Wifi size={16} className="text-verde-400" />
          <span className="text-xs font-black text-white uppercase tracking-widest">Estado del Sistema</span>
        </div>
        {[
          { label: 'API Backend', ok: true },
          { label: 'Base de Datos', ok: true },
          { label: 'Chatbot IA', ok: true },
          { label: 'Email SMTP', ok: false },
          { label: 'SIMIT', ok: true },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-verde-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]'}`} />
            <span className={`text-[11px] font-bold ${s.ok ? 'text-gris-300' : 'text-yellow-300'}`}>{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl">
          <Activity size={12} className="text-verde-400" />
          <span className="text-[11px] font-black text-verde-400">{enCurso} trámite{enCurso !== 1 ? 's' : ''} en curso ahora</span>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Trámites del Mes" value={487} subvalue="Comparativo: +12% vs mes anterior" icon={CalendarCheck} gradient="bg-gradient-to-br from-verde-500 to-verde-700" trend="+12%" trendUp={true} delay={0} />
        <StatCard label="Ciudadanos Activos" value={1342} subvalue="Registrados en el sistema" icon={UsersIcon} gradient="bg-gradient-to-br from-blue-500 to-blue-700" trend="+8%" trendUp={true} delay={0.08} />
        <StatCard label="Cursos Aprobados" value={314} subvalue="Tasa de éxito: 91.4%" icon={Award} gradient="bg-gradient-to-br from-purple-500 to-purple-700" trend="+5%" trendUp={true} delay={0.16} />
        <StatCard label="Descuentos Emitidos" value={289} subvalue="Ahorro ciudadanos: $1.2B COP" icon={Zap} gradient="bg-gradient-to-br from-orange-500 to-orange-600" trend="+19%" trendUp={true} delay={0.24} />
      </div>

      {/* ── SECONDARY KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hoy: Confirmadas', value: 34, icon: CheckCircle, color: 'text-verde-600', bg: 'bg-verde-50 border-verde-200' },
          { label: 'Hoy: En Curso', value: enCurso, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Hoy: Canceladas', value: 3, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
          { label: 'Hoy: Pendientes', value: 8, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${item.bg}`}
          >
            <item.icon size={20} className={item.color} />
            <div>
              <p className="text-[10px] font-black text-gris-500 uppercase tracking-wider">{item.label}</p>
              <p className={`text-2xl font-display font-black ${item.color}`}>{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2 bg-white border border-gris-200 rounded-3xl p-7 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-black text-gris-900 flex items-center gap-2.5">
                <TrendingUp size={20} className="text-verde-500" />
                Trámites por Período
              </h3>
              <p className="text-[11px] text-gris-400 font-bold uppercase tracking-wider mt-1">Comparativo aprobados vs total</p>
            </div>
            <div className="flex gap-1 bg-gris-100 p-1 rounded-xl">
              {['semana', 'mes'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${
                    activeTab === t ? 'bg-white text-verde-700 shadow-sm' : 'text-gris-400 hover:text-gris-700'
                  }`}
                >
                  {t === 'semana' ? 'Esta semana' : 'Tendencia'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'semana' ? (
                <AreaChart data={WEEKLY_DATA}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tramites" name="Trámites" stroke="#22c55e" strokeWidth={2.5} fill="url(#g1)" dot={false} activeDot={{ r: 6, fill: '#22c55e' }} />
                  <Area type="monotone" dataKey="aprobados" name="Aprobados" stroke="#3b82f6" strokeWidth={2.5} fill="url(#g2)" dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  <Area type="monotone" dataKey="cursos" name="Cursos" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={MONTHLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="tramites" name="Trámites" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={50} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gris-100">
            {[{ color: '#22c55e', label: 'Trámites totales' }, { color: '#3b82f6', label: 'Aprobados' }, { color: '#a855f7', label: 'Cursos virtuales' }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                <span className="text-[11px] font-bold text-gris-500">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Channels Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="bg-white border border-gris-200 rounded-3xl p-7 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-display font-black text-gris-900 mb-1">Canal de Origen</h3>
          <p className="text-[11px] text-gris-400 font-bold uppercase tracking-wider mb-6">¿Desde dónde agendan?</p>

          <div className="relative flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CHANNELS_DATA} cx="50%" cy="50%" innerRadius="62%" outerRadius="85%" paddingAngle={6} dataKey="value" animationDuration={1400} animationBegin={200}>
                  {CHANNELS_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-display font-black text-gris-900">487</span>
              <span className="text-[10px] font-black text-gris-400 uppercase tracking-widest">Total Mes</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {CHANNELS_DATA.map(ch => (
              <div key={ch.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ch.color }} />
                  <span className="text-sm font-bold text-gris-700">{ch.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gris-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(ch.value / 487) * 100}%`, background: ch.color }} />
                  </div>
                  <span className="font-black text-gris-900 text-sm w-8 text-right">{ch.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── TABLE + ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citas Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="lg:col-span-2 bg-white border border-gris-200 rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="px-7 py-5 border-b border-gris-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-black text-gris-900">Turnos de Hoy</h3>
              <p className="text-[11px] text-gris-400 font-bold uppercase tracking-wider mt-0.5">
                {CITAS_HOY.length} turnos programados · {enCurso} en atención
              </p>
            </div>
            <Link to="/citas" className="flex items-center gap-2 text-xs font-black text-verde-600 bg-verde-50 hover:bg-verde-100 border border-verde-200 px-4 py-2.5 rounded-xl transition-all">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gris-50/80 text-gris-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-gris-100">
                  <th className="px-6 py-4 text-left">Ciudadano</th>
                  <th className="px-6 py-4 text-center">Hora</th>
                  <th className="px-6 py-4 text-center">Canal</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-100">
                {CITAS_HOY.map((cita, i) => (
                  <motion.tr
                    key={cita.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    className="hover:bg-gris-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-cali-gradient flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {cita.avatar}
                        </div>
                        <div>
                          <p className="font-black text-gris-900 text-sm leading-tight">{cita.ciudadano}</p>
                          <p className="text-[10px] text-gris-400 font-bold mt-0.5">CC: {cita.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-gris-50 border border-gris-200 px-3 py-1.5 rounded-xl text-xs font-black text-gris-800">
                        <Clock size={11} className="text-verde-500" />
                        {cita.hora} AM
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cita.canal === 'chatbot' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {cita.canal === 'chatbot' ? '🤖 Chatbot' : '💻 Web'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cita.estado === 'confirmada' ? 'bg-verde-50 text-verde-700' :
                        cita.estado === 'en_curso' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cita.estado === 'en_curso' ? 'bg-blue-500 animate-pulse' : ''}`} />
                        {cita.estado === 'confirmada' ? 'Confirmada' : cita.estado === 'en_curso' ? 'En Atención' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-gris-100 text-gris-400 hover:text-gris-700 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 }}
          className="bg-gris-900 rounded-3xl p-7 flex flex-col border border-white/5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-7">
            <h3 className="text-lg font-display font-black text-white flex items-center gap-2.5">
              <Activity size={18} className="text-verde-400" />
              Actividad en Vivo
            </h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-verde-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 bg-verde-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-verde-400 uppercase">Live</span>
            </div>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {ACTIVITY_LOGS.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.07 }}
                className="flex gap-3.5 group"
              >
                <div className="flex flex-col items-center mt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${log.color} shadow-lg flex-shrink-0 group-hover:scale-125 transition-transform`} />
                  {idx < ACTIVITY_LOGS.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1.5" />}
                </div>
                <div className="pb-5 min-w-0">
                  <p className="text-[10px] font-black text-gris-400 uppercase tracking-widest">{log.tipo}</p>
                  <p className="text-xs text-gris-300 font-medium mt-1 leading-relaxed line-clamp-2">{log.desc}</p>
                  <p className="text-[9px] text-verde-500/70 font-black mt-1.5 uppercase tracking-wide">{log.tiempo}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link to="/logs" className="mt-6 pt-5 border-t border-white/10 text-[10px] font-black text-gris-500 uppercase tracking-[0.2em] hover:text-verde-400 text-center transition-colors flex items-center justify-center gap-2">
            <Eye size={12} /> Ver historial completo
          </Link>
        </motion.div>
      </div>

      {/* ── SEDES STATUS (super_admin only) ── */}
      {user?.rol === 'super_admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-display font-black text-gris-900 flex items-center gap-2.5">
              <Building2 size={20} className="text-verde-500" />
              Estado de Sedes
            </h3>
            <Link to="/sedes" className="text-xs font-black text-verde-600 hover:text-verde-700 flex items-center gap-1.5 transition-colors">
              Gestionar sedes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {SEDES_STATUS.map((sede, i) => (
              <motion.div
                key={sede.nombre}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                  sede.estado === 'mantenimiento' ? 'border-orange-200' : 'border-gris-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${sede.estado === 'mantenimiento' ? 'bg-orange-50' : 'bg-verde-50'}`}>
                    <MapPin size={18} className={sede.estado === 'mantenimiento' ? 'text-orange-500' : 'text-verde-600'} />
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                    sede.estado === 'activa' ? 'bg-verde-50 text-verde-700' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {sede.estado === 'activa' ? '● Activa' : '⚠ Mant.'}
                  </span>
                </div>
                <h4 className="font-display font-black text-gris-900 text-base leading-tight">{sede.nombre}</h4>
                <p className="text-[11px] text-gris-400 font-medium mt-1 mb-4">{sede.direccion}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-black text-gris-500 mb-1.5">
                    <span>Capacidad hoy</span>
                    <span className={sede.pct >= 90 ? 'text-red-500' : 'text-gris-600'}>{sede.pct}%</span>
                  </div>
                  <div className="h-2 bg-gris-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sede.pct}%` }}
                      transition={{ delay: 0.8 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${sede.pct >= 90 ? 'bg-red-500' : sede.pct >= 70 ? 'bg-orange-400' : 'bg-verde-500'}`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gris-100">
                  <div>
                    <p className="text-[9px] font-black text-gris-400 uppercase tracking-widest">Trámites hoy</p>
                    <p className="font-display font-black text-gris-900 text-xl">{sede.tramitesHoy}</p>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-gris-100 flex items-center justify-center font-black text-verde-700 text-sm">
                    {sede.admin.charAt(0)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
