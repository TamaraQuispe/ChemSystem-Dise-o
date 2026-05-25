# ChemSystem API

Backend REST para la plataforma educativa de química ChemSystem.

## Stack

- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT + bcrypt
- express-validator

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (copiar de .env.example)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chemsystem

# 3. Crear BD y poblar datos
createdb chemsystem
npm run db:seed

# 4. Iniciar servidor
npm run dev
```

API disponible en `http://localhost:3000/api`

## Usuario de prueba

- **Email:** julian@chemsystem.edu
- **Password:** password123

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil actual |
| GET | `/api/compounds?search=` | Buscar compuestos |
| GET | `/api/experiments/active/current` | Experimento activo |
| PUT | `/api/experiments/:id` | Actualizar simulación |
| POST | `/api/experiments/:id/predict` | Ejecutar predicción IA |
| POST | `/api/experiments/:id/reactants` | Añadir reactivo |
| GET | `/api/predictions` | Historial predicciones |
| GET | `/api/ai/recommendations` | Alertas IA |
| GET | `/api/notifications` | Notificaciones |
| GET | `/api/analytics/me` | Rendimiento |
| GET | `/api/modules` | Módulos educativos |
| GET | `/api/community` | Comunidad |

## Estructura MVC

```
src/
├── controllers/   # Controladores HTTP
├── routes/        # Rutas Express
├── models/        # Modelos Sequelize
├── services/      # Lógica de negocio
├── middlewares/   # Auth, validación, errores
├── config/        # Configuración DB
└── utils/         # Motor de predicción, seed
```
