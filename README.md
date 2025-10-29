# UVM QBank

Banco de preguntas universitario (roles 1–5) con **React (Vite)** + **Node.js (Express)** + **Sequelize** + **MariaDB**.  
UI con **Bootstrap 5** + **Bootswatch Zephyr** y paleta **rojo/blanco** (overrides).  
Autenticación **JWT**, estados de revisión de preguntas y **auditoría**.

---

## ⚙️ Requisitos

- **Node.js 20+**
- **MariaDB/MySQL** (XAMPP o similar) en `localhost:3306`
- **Git** (opcional)

---

## 🧩 Estructura

uvm-qbank/
├─ .env # Un solo archivo de entorno (raíz)
├─ backend/
│ ├─ src/
│ │ ├─ server.js # Express + middlewares
│ │ ├─ routes/ # /api/*
│ │ ├─ controllers/ # auth, questions, exams, ...
│ │ ├─ middleware/ # auth JWT, roles
│ │ ├─ models/ # Sequelize models
│ │ ├─ utils/audit.js # auditoría
│ │ └─ seed/seed.js # seed inicial (roles + admin)
│ └─ package.json
├─ frontend/
│ ├─ public/
│ │ └─ uvm-logo.svg # logo para sidebar
│ ├─ src/
│ │ ├─ api/axios.js
│ │ ├─ components/layout/ # Sidebar, AppLayout
│ │ ├─ pages/ # Login, Questions, Exams, Classes, Dashboard
│ │ ├─ styles/overrides.css # overrides rojo/blanco + Zephyr
│ │ └─ main.jsx # importa Zephyr, Icons y JS de Bootstrap
│ └─ package.json
└─ package.json # scripts raíz (dev/seed/reset-admin)


---

## 🔐 Variables de entorno (raíz `.env`)

> **Un solo archivo** `.env` en la **raíz** del repo:

```ini
# App
NODE_ENV=development
PORT_API=4444
PORT_WEB=3000

# DB
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=uvm_qbank
DB_USER=root
DB_PASS=

# Auth
JWT_SECRET=super-secret-uvm
JWT_EXPIRES=2d

# Microsoft (placeholder; botón visible, flujo pendiente)
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_REDIRECT_URI=http://localhost:4444/api/auth/microsoft/callback
MS_ENABLED=false

---

## 🚀 Instalación rápida (Windows + XAMPP)

    Crea base de datos:

CREATE DATABASE uvm_qbank;

    Instala dependencias:

# backend
cd backend && npm i && cd ..

# frontend
cd frontend && npm i
# (recomendado) instalar íconos dentro del frontend
npm i bootstrap-icons@1.13.1
cd ..

    Seed inicial (roles + admin):

npm --prefix backend run seed
# Admin: admin@uvm.local / admin123

    Ejecutar en desarrollo:

npm run dev
# Web: http://localhost:3000
# API: http://localhost:4444

## 👥 Roles y permisos

    1 Admin / 2 Coordinador / 3 Docente TC: CRUD de materias, semestres y preguntas; aprobar/rechazar preguntas.

    4 Docente: propone preguntas y genera exámenes para sus clases/curso/semestre/materias asignadas.

    5 Estudiante: presenta exámenes de su clase.

    Intentos: 1 intento; el docente habilita el examen (fecha/hora + duración).

## 🗂️ Estados de preguntas

proposed · approved · rejected + comentario de revisión.

## 🧭 Endpoints (resumen)

Auth

POST   /api/auth/login        { email, password } -> { token, user }
GET    /api/auth/me           (Bearer <token>)

Preguntas

GET    /api/questions
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id
POST   /api/questions/:id/approve
POST   /api/questions/:id/reject

Exámenes

GET    /api/exams
POST   /api/exams             { name, class_id, start_at, end_at, duration_min }
PUT    /api/exams/:id
DELETE /api/exams/:id

    Auditoría automática en create/update/approve/reject/delete.

## 🎨 UI / Tema

    Bootswatch Zephyr como base y overrides en frontend/src/styles/overrides.css para fijar rojo como --bs-primary (botones, focus, estados disabled/active/hover).

    Bootstrap Icons: importar el CSS en main.jsx o usar CDN (ver “Notas de íconos”).

    Sidebar rojo degradado, texto blanco, logo uvm-logo.svg sobre el bloque de usuario.

    Login de una columna, feedback de error con shake breve y alerta visible.

## 🔔 Notas de íconos (Bootstrap Icons)

Opción A (recomendada): instalar dentro de frontend/ y importar en src/main.jsx:

cd frontend
npm i bootstrap-icons@1.13.1

// src/main.jsx
import 'bootswatch/dist/zephyr/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/overrides.css';

Opción B (CDN): agrega en frontend/public/index.html:

<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">

Opción C: si decides servir fuentes fuera del root del proyecto, ajusta server.fs.allow en frontend/vite.config.js. (Ver docs de Vite).
v3.vitejs.dev

## 🧪 Scripts útiles

Desde la raíz:

npm run dev                 # web + api
npm --prefix backend run seed
npm --prefix backend run reset-admin

reset-admin vuelve a poner admin@uvm.local / admin123.

## 🛟 Troubleshooting

    --Credenciales para probar
    --Admin: admin@uvm.local / admin123
    --Coordinador: coord@uvm.local / admin123
    --Docente TC: prof.tc@uvm.local / admin123
    --Docente: prof@uvm.local / admin123
    --Estudiantes: est1@uvm.local, est2@uvm.local / admin123

    Íconos no se ven (cuadritos)
    Instala bootstrap-icons en frontend/ o usa CDN. Si insistes en servir desde fuera, configura server.fs.allow en Vite.
    Bootstrap Icons+2npm+2

    Toast/JS de Bootstrap no funciona
    Importa el bundle JS en main.jsx:

    import * as bootstrap from 'bootstrap';
    window.bootstrap = bootstrap;

    Warnings de React Router (future flags)
    Son de v7; se pueden habilitar future flags gradualmente.
    reactrouter.com+1

    Sequelize y MariaDB/MySQL
    Usa mysql2 (v6) o el dialecto dedicado (v7). Revisa compatibilidad si actualizas.
    sequelize.org+1

## 🔐 Seguridad

    No publiques .env.

    Cambia JWT_SECRET y las credenciales del admin seed en ambientes reales.

    Habilita Microsoft SSO solo con credenciales válidas de Azure AD.

## 📚 Referencias

    Bootswatch Zephyr (tema):
    bootswatch.com+2bootswatch.com+2

    Bootstrap 5 (Toasts y componentes):
    getbootstrap.com

    Bootstrap Icons (instalación/uso):
    Bootstrap Icons+2npm+2

    Vite server.fs.allow:
    v3.vitejs.dev

    Sequelize (v6 Getting Started / v7 MySQL dialect):
    sequelize.org+1

    JSON Web Token (jsonwebtoken):
    npm

## 📄 Licencia

Uso académico interno. Revisa licencias de terceros: Bootstrap/Bootswatch/Bootstrap Icons/Sequelize/jsonwebtoken.

::contentReference[oaicite:10]{index=10}