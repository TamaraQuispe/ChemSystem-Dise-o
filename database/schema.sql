-- ChemSystem - PostgreSQL Schema
-- Plataforma educativa de química con simuladores y predicción IA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- COMPOUNDS (Reactivos / Compuestos químicos)
-- ============================================================
CREATE TABLE compounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  label VARCHAR(120) NOT NULL,
  concentration VARCHAR(32),
  color_class VARCHAR(120),
  dot_class VARCHAR(64),
  formula VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compounds_code ON compounds(code);
CREATE INDEX idx_compounds_name ON compounds(name);

-- ============================================================
-- EDUCATIONAL MODULES
-- ============================================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  difficulty VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 30,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER MODULE PROGRESS
-- ============================================================
CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, module_id)
);

CREATE INDEX idx_user_modules_user ON user_modules(user_id);

-- ============================================================
-- EXPERIMENTS (Simulaciones de laboratorio)
-- ============================================================
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL DEFAULT 'Experimento de Catálisis',
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  temperature DECIMAL(6,2) NOT NULL DEFAULT 298.00,
  pressure DECIMAL(6,2) NOT NULL DEFAULT 1.20,
  conc_a DECIMAL(5,2) NOT NULL DEFAULT 0.50,
  conc_b DECIMAL(5,2) NOT NULL DEFAULT 0.20,
  active_timeline_step VARCHAR(20) NOT NULL DEFAULT 'Transición'
    CHECK (active_timeline_step IN ('Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio')),
  zoom_level DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  show_grid BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiments_user ON experiments(user_id);
CREATE INDEX idx_experiments_status ON experiments(status);

-- ============================================================
-- EXPERIMENT COMPOUNDS (Reactivos en workspace)
-- ============================================================
CREATE TABLE experiment_compounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE RESTRICT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (experiment_id, compound_id)
);

CREATE INDEX idx_experiment_compounds_exp ON experiment_compounds(experiment_id);

-- ============================================================
-- AI PREDICTIONS
-- ============================================================
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  yield_percent INTEGER NOT NULL CHECK (yield_percent BETWEEN 0 AND 100),
  stability_percent INTEGER NOT NULL CHECK (stability_percent BETWEEN 0 AND 100),
  energy_value DECIMAL(8,2),
  atoms_count INTEGER,
  risk_level VARCHAR(20) CHECK (risk_level IN ('Bajo', 'Moderado', 'Alto')),
  global_state VARCHAR(20) CHECK (global_state IN ('Estable', 'Advertencia', 'Crítico')),
  catalyst_efficiency INTEGER,
  enthalpy DECIMAL(10,2),
  entropy DECIMAL(10,2),
  accuracy_percent INTEGER CHECK (accuracy_percent BETWEEN 0 AND 100),
  estimated_time VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_experiment ON predictions(experiment_id);

-- ============================================================
-- KINETIC SNAPSHOTS (Datos del gráfico predictivo)
-- ============================================================
CREATE TABLE kinetic_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  time_label VARCHAR(10) NOT NULL,
  yield_percent INTEGER NOT NULL,
  stability_percent INTEGER NOT NULL,
  is_prediction BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kinetic_experiment ON kinetic_snapshots(experiment_id);

-- ============================================================
-- AI RECOMMENDATIONS (Alertas IA del simulador)
-- ============================================================
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(30) NOT NULL DEFAULT 'tip' CHECK (type IN ('tip', 'warning', 'success')),
  message TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'achievement', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================
-- USER ANALYTICS (Rendimiento agregado)
-- ============================================================
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_experiments INTEGER NOT NULL DEFAULT 0,
  avg_yield DECIMAL(5,2) DEFAULT 0,
  avg_accuracy DECIMAL(5,2) DEFAULT 0,
  best_yield INTEGER DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMMUNITY POSTS (Comunidad)
-- ============================================================
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'general',
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user ON community_posts(user_id);

-- Trigger updated_at for experiments and users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
