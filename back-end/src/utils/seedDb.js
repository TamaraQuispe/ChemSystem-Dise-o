require('dotenv').config();
const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Compound,
  Module,
  UserModule,
  Experiment,
  ExperimentCompound,
  Prediction,
  KineticSnapshot,
  AiRecommendation,
  Notification,
  UserAnalytics,
  CommunityPost,
} = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✓ Tablas recreadas');

    const passwordHash = await bcrypt.hash('password123', 10);

    const julian = await User.create({
      email: 'julian@chemsystem.edu',
      password_hash: passwordHash,
      name: 'Julian Mendoza',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian',
      role: 'student',
      level: 14,
      xp: 1250,
    });

    const maria = await User.create({
      email: 'maria@chemsystem.edu',
      password_hash: passwordHash,
      name: 'María García',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      role: 'student',
      level: 12,
      xp: 980,
    });

    await User.create({
      email: 'profesor@chemsystem.edu',
      password_hash: passwordHash,
      name: 'Dr. Carlos Ruiz',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      role: 'teacher',
      level: 25,
      xp: 5200,
    });

    const compounds = await Compound.bulkCreate([
      { code: 'H2SO4', name: 'H₂SO₄', label: 'Ácido Sulfúrico', concentration: '98%', color_class: 'text-blue-500 bg-blue-50 border-blue-100', dot_class: 'bg-blue-500', formula: 'H2SO4' },
      { code: 'KMnO4', name: 'KMnO₄', label: 'Permanganato de Potasio', concentration: '0.1 M', color_class: 'text-emerald-500 bg-emerald-50 border-emerald-100', dot_class: 'bg-emerald-500', formula: 'KMnO4' },
      { code: 'NaOH', name: 'NaOH', label: 'Hidróxido de Sodio', concentration: '2.0 M', color_class: 'text-purple-500 bg-purple-50 border-purple-100', dot_class: 'bg-purple-500', formula: 'NaOH' },
      { code: 'H2O', name: 'H₂O', label: 'Agua Destilada', concentration: '1.0 M', color_class: 'text-blue-500 bg-blue-50 border-blue-100', dot_class: 'bg-blue-500', formula: 'H2O' },
      { code: 'O2', name: 'O₂', label: 'Oxígeno Molecular', concentration: 'gas', color_class: 'text-emerald-500 bg-emerald-50 border-emerald-100', dot_class: 'bg-emerald-500', formula: 'O2' },
    ]);

    const modules = await Module.bulkCreate([
      { title: 'Fundamentos de Catálisis', description: 'Introducción a catalizadores', slug: 'fundamentos-catalisis', difficulty: 'beginner', duration_minutes: 45, order_index: 1 },
      { title: 'Cinética Química Avanzada', description: 'Velocidad de reacción', slug: 'cinetica-avanzada', difficulty: 'intermediate', duration_minutes: 60, order_index: 2 },
      { title: 'Termodinámica Aplicada', description: 'Entalpía y entropía', slug: 'termodinamica-aplicada', difficulty: 'advanced', duration_minutes: 90, order_index: 3 },
      { title: 'Laboratorio Virtual', description: 'Simuladores interactivos', slug: 'laboratorio-virtual', difficulty: 'intermediate', duration_minutes: 120, order_index: 4 },
    ]);

    await UserModule.bulkCreate([
      { user_id: julian.id, module_id: modules[0].id, progress_percent: 100, status: 'completed', started_at: new Date() },
      { user_id: julian.id, module_id: modules[1].id, progress_percent: 65, status: 'in_progress', started_at: new Date() },
      { user_id: julian.id, module_id: modules[3].id, progress_percent: 40, status: 'in_progress', started_at: new Date() },
    ]);

    const experiment = await Experiment.create({
      user_id: julian.id,
      title: 'Simulador de Catálisis',
      status: 'active',
      temperature: 298,
      pressure: 1.2,
      conc_a: 0.5,
      conc_b: 0.2,
      active_timeline_step: 'Transición',
    });

    await ExperimentCompound.bulkCreate([
      { experiment_id: experiment.id, compound_id: compounds[0].id },
      { experiment_id: experiment.id, compound_id: compounds[2].id },
    ]);

    await Prediction.bulkCreate([
      { experiment_id: experiment.id, user_id: julian.id, yield_percent: 89, stability_percent: 94, energy_value: -4.2, atoms_count: 1428, risk_level: 'Bajo', global_state: 'Estable', catalyst_efficiency: 75, enthalpy: -285, entropy: 130, accuracy_percent: 92, estimated_time: '2m 34s' },
      { user_id: julian.id, yield_percent: 85, stability_percent: 88, energy_value: -4.5, atoms_count: 1380, risk_level: 'Moderado', global_state: 'Advertencia', catalyst_efficiency: 72, enthalpy: -290, entropy: 125, accuracy_percent: 88, estimated_time: '3m 10s' },
    ]);

    await KineticSnapshot.bulkCreate([
      { experiment_id: experiment.id, time_label: '10s', yield_percent: 20, stability_percent: 95, is_prediction: false, order_index: 0 },
      { experiment_id: experiment.id, time_label: '30s', yield_percent: 42, stability_percent: 91, is_prediction: false, order_index: 1 },
      { experiment_id: experiment.id, time_label: '1m', yield_percent: 63, stability_percent: 85, is_prediction: false, order_index: 2 },
      { experiment_id: experiment.id, time_label: '1.5m', yield_percent: 78, stability_percent: 80, is_prediction: false, order_index: 3 },
      { experiment_id: experiment.id, time_label: '2m', yield_percent: 89, stability_percent: 94, is_prediction: true, order_index: 4 },
    ]);

    await AiRecommendation.bulkCreate([
      { type: 'tip', message: 'La IA recomienda aumentar la temperatura a 310 K para optimizar el rendimiento.', priority: 1 },
      { type: 'success', message: 'Reducir concentración de O₂ mejorará la estabilidad global.', priority: 2 },
      { type: 'warning', message: 'Presión elevada detectada. Considera reducir a 1.2 atm.', priority: 3 },
    ]);

    await Notification.bulkCreate([
      { user_id: julian.id, title: 'Nuevo módulo disponible', message: 'El módulo de Termodinámica Aplicada ya está disponible.', type: 'info', is_read: false },
      { user_id: julian.id, title: 'Logro desbloqueado', message: 'Completaste 10 experimentos de catálisis.', type: 'achievement', is_read: true },
      { user_id: julian.id, title: 'Predicción IA lista', message: 'Tu última simulación alcanzó 92% de precisión.', type: 'system', is_read: false },
    ]);

    await UserAnalytics.bulkCreate([
      { user_id: julian.id, total_experiments: 24, avg_yield: 87.5, avg_accuracy: 90, best_yield: 94, rank_position: 3 },
      { user_id: maria.id, total_experiments: 18, avg_yield: 82.3, avg_accuracy: 85.5, best_yield: 91, rank_position: 7 },
    ]);

    await CommunityPost.bulkCreate([
      { user_id: maria.id, title: '¿Cómo optimizar catálisis en fase homogénea?', content: 'Estoy trabajando con permanganato...', category: 'dudas', likes_count: 12 },
      { user_id: julian.id, title: 'Mi mejor rendimiento: 94%', content: 'Logré estabilidad alta usando 310K.', category: 'logros', likes_count: 28 },
    ]);

    console.log('✓ Seed completado');
    console.log('  Usuario demo: julian@chemsystem.edu / password123');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error en seed:', err);
    process.exit(1);
  }
}

seed();
