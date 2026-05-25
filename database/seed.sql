-- ChemSystem - Datos de prueba
-- Ejecutar después de schema.sql

-- Contraseña para todos los usuarios de prueba: password123
-- Hash bcrypt generado con cost 10

INSERT INTO users (id, email, password_hash, name, avatar_url, role, level, xp) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'julian@chemsystem.edu', '$2b$10$rQZ8K8Y8Y8Y8Y8Y8Y8Y8YuGKxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'Julian Mendoza', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian', 'student', 14, 1250),
  ('a0000000-0000-4000-8000-000000000002', 'maria@chemsystem.edu', '$2b$10$rQZ8K8Y8Y8Y8Y8Y8Y8Y8YuGKxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'María García', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', 'student', 12, 980),
  ('a0000000-0000-4000-8000-000000000003', 'profesor@chemsystem.edu', '$2b$10$rQZ8K8Y8Y8Y8Y8Y8Y8Y8YuGKxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'Dr. Carlos Ruiz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 'teacher', 25, 5200);

INSERT INTO compounds (id, code, name, label, concentration, color_class, dot_class, formula) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'H2SO4', 'H₂SO₄', 'Ácido Sulfúrico', '98%', 'text-blue-500 bg-blue-50 border-blue-100', 'bg-blue-500', 'H2SO4'),
  ('b0000000-0000-4000-8000-000000000002', 'KMnO4', 'KMnO₄', 'Permanganato de Potasio', '0.1 M', 'text-emerald-500 bg-emerald-50 border-emerald-100', 'bg-emerald-500', 'KMnO4'),
  ('b0000000-0000-4000-8000-000000000003', 'NaOH', 'NaOH', 'Hidróxido de Sodio', '2.0 M', 'text-purple-500 bg-purple-50 border-purple-100', 'bg-purple-500', 'NaOH'),
  ('b0000000-0000-4000-8000-000000000004', 'H2O', 'H₂O', 'Agua Destilada', '1.0 M', 'text-blue-500 bg-blue-50 border-blue-100', 'bg-blue-500', 'H2O'),
  ('b0000000-0000-4000-8000-000000000005', 'O2', 'O₂', 'Oxígeno Molecular', 'gas', 'text-emerald-500 bg-emerald-50 border-emerald-100', 'bg-emerald-500', 'O2');

INSERT INTO modules (id, title, description, slug, difficulty, duration_minutes, order_index) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Fundamentos de Catálisis', 'Introducción a catalizadores homogéneos y heterogéneos', 'fundamentos-catalisis', 'beginner', 45, 1),
  ('c0000000-0000-4000-8000-000000000002', 'Cinética Química Avanzada', 'Velocidad de reacción y mecanismos', 'cinetica-avanzada', 'intermediate', 60, 2),
  ('c0000000-0000-4000-8000-000000000003', 'Termodinámica Aplicada', 'Entalpía, entropía y espontaneidad', 'termodinamica-aplicada', 'advanced', 90, 3),
  ('c0000000-0000-4000-8000-000000000004', 'Laboratorio Virtual', 'Simuladores interactivos de reacciones', 'laboratorio-virtual', 'intermediate', 120, 4);

INSERT INTO user_modules (user_id, module_id, progress_percent, status, started_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 100, 'completed', NOW() - INTERVAL '30 days'),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 65, 'in_progress', NOW() - INTERVAL '10 days'),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 40, 'in_progress', NOW() - INTERVAL '5 days');

INSERT INTO experiments (id, user_id, title, status, temperature, pressure, conc_a, conc_b, active_timeline_step) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Simulador de Catálisis', 'active', 298, 1.2, 0.5, 0.2, 'Transición');

INSERT INTO experiment_compounds (experiment_id, compound_id) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003');

INSERT INTO predictions (experiment_id, user_id, yield_percent, stability_percent, energy_value, atoms_count, risk_level, global_state, catalyst_efficiency, enthalpy, entropy, accuracy_percent, estimated_time) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 89, 94, -4.2, 1428, 'Bajo', 'Estable', 75, -285, 130, 92, '2m 34s'),
  (NULL, 'a0000000-0000-4000-8000-000000000001', 85, 88, -4.5, 1380, 'Moderado', 'Advertencia', 72, -290, 125, 88, '3m 10s');

INSERT INTO kinetic_snapshots (experiment_id, time_label, yield_percent, stability_percent, is_prediction, order_index) VALUES
  ('d0000000-0000-4000-8000-000000000001', '10s', 20, 95, FALSE, 0),
  ('d0000000-0000-4000-8000-000000000001', '30s', 42, 91, FALSE, 1),
  ('d0000000-0000-4000-8000-000000000001', '1m', 63, 85, FALSE, 2),
  ('d0000000-0000-4000-8000-000000000001', '1.5m', 78, 80, FALSE, 3),
  ('d0000000-0000-4000-8000-000000000001', '2m', 89, 94, TRUE, 4);

INSERT INTO ai_recommendations (type, message, priority) VALUES
  ('tip', 'La IA recomienda aumentar la temperatura a 310 K para optimizar el rendimiento.', 1),
  ('success', 'Reducir concentración de O₂ mejorará la estabilidad global.', 2),
  ('warning', 'Presión elevada detectada. Considera reducir a 1.2 atm.', 3);

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Nuevo módulo disponible', 'El módulo de Termodinámica Aplicada ya está disponible.', 'info', FALSE),
  ('a0000000-0000-4000-8000-000000000001', 'Logro desbloqueado', 'Completaste 10 experimentos de catálisis.', 'achievement', TRUE),
  ('a0000000-0000-4000-8000-000000000001', 'Predicción IA lista', 'Tu última simulación alcanzó 92% de precisión.', 'system', FALSE);

INSERT INTO user_analytics (user_id, total_experiments, avg_yield, avg_accuracy, best_yield, rank_position) VALUES
  ('a0000000-0000-4000-8000-000000000001', 24, 87.5, 90.0, 94, 3),
  ('a0000000-0000-4000-8000-000000000002', 18, 82.3, 85.5, 91, 7);

INSERT INTO community_posts (user_id, title, content, category, likes_count) VALUES
  ('a0000000-0000-4000-8000-000000000002', '¿Cómo optimizar catálisis en fase homogénea?', 'Estoy trabajando con permanganato y necesito consejos sobre temperatura óptima.', 'dudas', 12),
  ('a0000000-0000-4000-8000-000000000001', 'Mi mejor rendimiento: 94%', 'Logré estabilidad alta usando 310K y presión 1.2 atm.', 'logros', 28);
