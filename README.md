# ChemSystem — Simulador

Plataforma educativa SaaS de química con laboratorio virtual, simuladores de catálisis y predicción IA.

## Estructura del proyecto

```
project-root/
├── front-end/      # React + Vite + Tailwind
├── back-end/       # Node.js + Express + Sequelize
├── database/       # schema.sql, seed.sql
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación completa

### 1. Base de datos

```bash
createdb chemsystem
psql -d chemsystem -f database/schema.sql
# Opcional: psql -d chemsystem -f database/seed.sql
```

O usar el seed de Sequelize:

```bash
cd back-end
npm install
npm run db:seed
```

### 2. Backend

```bash
cd back-end
cp .env.example .env   # Ajustar DATABASE_URL si es necesario
npm install
npm run dev
```

API: `http://localhost:3000/api`

### 3. Frontend

```bash
cd front-end
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Usuario de prueba

| Campo | Valor |
|-------|-------|
| Email | julian@chemsystem.edu |
| Password | password123 |

El frontend inicia sesión automáticamente con este usuario al conectar con el API.

## Variables de entorno

### Frontend (`front-end/.env`)

```
VITE_API_URL=http://localhost:3000/api
```

### Backend (`back-end/.env`)

```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chemsystem
JWT_SECRET=chemsystem_jwt_secret_change_in_production_2026
CORS_ORIGIN=http://localhost:5173
```

## API REST — Resumen

| Recurso | Endpoints |
|---------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Usuarios | `GET/PUT/DELETE /users/:id` |
| Compuestos | `GET /compounds?search=` |
| Experimentos | `GET /experiments/active/current`, `PUT /experiments/:id`, `POST .../predict` |
| Predicciones | `GET /predictions` |
| Módulos | `GET /modules` |
| IA | `GET /ai/recommendations` |
| Notificaciones | `GET /notifications` |
| Analytics | `GET /analytics/me`, `GET /analytics/rankings` |
| Comunidad | `GET/POST /community` |

## Entidades detectadas del frontend

- **Usuarios** — autenticación JWT, XP, nivel, avatar
- **Compuestos** — stock de reactivos, búsqueda
- **Experimentos** — simulación (T, P, concentraciones, timeline)
- **Predicciones IA** — rendimiento, estabilidad, riesgo
- **Snapshots cinéticos** — gráfico de evolución
- **Módulos educativos** — progreso del alumno
- **Notificaciones** — alertas del sistema
- **Recomendaciones IA** — tips del simulador
- **Analytics** — rendimiento y rankings
- **Comunidad** — foro de dudas

## Modo offline

Si el backend no está disponible, el simulador funciona con datos locales (fallback) sin interrumpir la UI.

## Scripts

```bash
# Frontend
cd front-end && npm run dev && npm run build

# Backend
cd back-end && npm run dev && npm start
```
