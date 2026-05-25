# Base de datos ChemSystem

PostgreSQL con esquema relacional para la plataforma educativa de química.

## Requisitos

- PostgreSQL 14+
- Extensión `uuid-ossp` (incluida en el schema)

## Instalación

```bash
# Crear base de datos
createdb chemsystem

# Ejecutar schema y seed
psql -d chemsystem -f schema.sql
psql -d chemsystem -f seed.sql
```

## Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios, XP, nivel, autenticación |
| `compounds` | Compuestos químicos del stock |
| `modules` | Módulos educativos |
| `user_modules` | Progreso por usuario |
| `experiments` | Simulaciones de laboratorio |
| `experiment_compounds` | Reactivos en el workspace |
| `predictions` | Historial de predicciones IA |
| `kinetic_snapshots` | Datos del gráfico cinético |
| `ai_recommendations` | Alertas IA globales |
| `notifications` | Notificaciones por usuario |
| `user_analytics` | Estadísticas de rendimiento |
| `community_posts` | Publicaciones de comunidad |

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| julian@chemsystem.edu | password123 | student |
| maria@chemsystem.edu | password123 | student |
| profesor@chemsystem.edu | password123 | teacher |

> El backend regenera los hashes bcrypt al iniciar con `npm run db:seed` si usas Sequelize sync.

## Conexión

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chemsystem
```
