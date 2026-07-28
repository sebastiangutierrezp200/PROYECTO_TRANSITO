# 🚦 Sistema de Movilidad Cali
### Plataforma Virtual de Cursos Pedagógicos y Gestión de Multas de Tránsito

Plataforma 100% virtual para la gestión de comparendos y cursos de seguridad vial de la Secretaría de Movilidad de Santiago de Cali. Incluye consulta en tiempo real del SIMIT, descuento automático del 50% por curso aprobado, y el asistente virtual MOV-IA.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima |
|-------------|--------------|
| [Node.js](https://nodejs.org/) | v20 o superior |
| npm | v9 o superior |
| Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Gratis (tier M0) |

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Proyecto_Transito
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

Crea el archivo `.env` copiando la plantilla:
```bash
cp .env.example .env
```

Edita `.env` y añade tu cadena de conexión de MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster.mongodb.net/movilidad_cali
JWT_SECRET=movilidad_cali_secreto_2025_seguro
JWT_EXPIRES_IN=8h
PORT=3001
FRONTEND_URL=http://localhost:5173
```

> ℹ️ Las variables de SMTP y Anthropic son **opcionales** para el funcionamiento básico.

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

---

## ▶️ Ejecutar el Proyecto

Abre **dos terminales simultáneas**:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
Al iniciar, verás:
```
✅ Base de datos lista.
🚀 Servidor corriendo en http://localhost:3001
```
> ⚡ La primera vez que levanta, el sistema siembra automáticamente la base de datos con 20 ciudadanos, comparendos y admins de prueba.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Abre el navegador en: **http://localhost:5173**

---

## 🔑 Credenciales de Prueba

### Panel Administrativo → `/login` (selecciona "Administrador")

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `superadmin` | `Admin123*` | Super Administrador |
| `admin_norte` | `Admin123*` | Admin Sede Norte |
| `admin_sur` | `Admin123*` | Admin Sede Sur |
| `admin_centro` | `Admin123*` | Admin Sede Centro |

### Portal Ciudadano → `/login`

Los ciudadanos se registran en `/registro` o usa uno del seed:

| Email | Contraseña |
|-------|-----------|
| `ciudadano1@prueba.com` | `Pass123*` |
| `ciudadano2@prueba.com` | `Pass123*` |
| *(hasta ciudadano20)* | `Pass123*` |

---

## 🗺️ URLs Principales

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173` | Landing page pública |
| `http://localhost:5173/login` | Login (ciudadano / admin) |
| `http://localhost:5173/registro` | Registro de nuevos ciudadanos |
| `http://localhost:5173/curso` | Portal del curso virtual |
| `http://localhost:5173/dashboard` | Panel administrativo |
| `http://localhost:3001` | API Backend (health check) |
| `http://localhost:3001/api/...` | Endpoints REST |

---

## 🤖 Funcionalidades Principales

### Para Ciudadanos
- **Curso Virtual 100%** — 5 módulos de educación vial basados en la Ley 769 de 2002
- **Examen Inteligente** — Anti-trampa, ayudas limitadas, puntaje en tiempo real
- **Consulta SIMIT** — Búsqueda de multas por cédula o placa directamente en el sistema nacional
- **Descuento 50%** — Automático al aprobar el examen (mínimo 70%)
- **Certificado PDF** — Descargable con código de verificación único
- **MOV-IA** — Asistente virtual animado disponible en todas las páginas

### Para Administradores
- **Dashboard** — Métricas en tiempo real de cursos, citas y ciudadanos
- **Gestión de Usuarios** — CRUD completo de ciudadanos
- **Control de Horarios** — Módulos virtuales con cupos
- **Actividad Logs** — Registro de todas las acciones del sistema
- **Agenda Inteligente** — Vista de calendario con estado de citas

---

## ⚙️ Variables de Entorno Completas

Ver [`backend/.env.example`](./backend/.env.example) para la lista completa.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `MONGODB_URI` | ✅ Sí | Cadena de MongoDB Atlas |
| `JWT_SECRET` | ✅ Sí | Clave secreta para tokens |
| `JWT_EXPIRES_IN` | ✅ Sí | Expiración del token (ej: `8h`) |
| `PORT` | ⚪ No | Puerto del backend (default: 3001) |
| `FRONTEND_URL` | ⚪ No | URL del frontend para CORS |
| `SMTP_HOST` | ⚪ No | Host SMTP para emails |
| `SMTP_USER` | ⚪ No | Usuario SMTP |
| `SMTP_PASS` | ⚪ No | Contraseña de aplicación SMTP |
| `ANTHROPIC_API_KEY` | ⚪ No | API Key de Claude para PQR IA |
| `SIMIT_TIMEOUT` | ⚪ No | Timeout de consulta SIMIT (ms) |

---

## 🏗️ Arquitectura del Proyecto

```
Proyecto_Transito/
├── backend/              # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/       # DB, seed automático
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Auth, validaciones
│   │   ├── models/       # Esquemas Mongoose
│   │   ├── routes/       # Definición de endpoints
│   │   └── services/     # SIMIT, email, chatbot engine, descuentos
│   └── app.js            # Entry point
│
└── frontend/             # SPA con React + Vite + TailwindCSS
    └── src/
        ├── components/   # Componentes reutilizables (MOV-IA, cards, etc.)
        ├── contexts/     # Estado global (Auth, Course)
        ├── layouts/      # AdminLayout, CourseLayout
        ├── pages/        # Vistas principales
        └── services/     # Axios API client
```

---

## 🛠️ Comandos Útiles

```bash
# Re-sembrar la base de datos desde cero
cd backend && node run-seed.js

# Verificar el estado del servidor
curl http://localhost:3001

# Ver logs del backend en tiempo real
cd backend && npm start

# Build de producción del frontend
cd frontend && npm run build
```

---

## 📝 Licencia

Proyecto educativo — Secretaría de Movilidad de Santiago de Cali.
