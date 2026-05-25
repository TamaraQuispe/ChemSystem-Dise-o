const {
  Experiment,
  Compound,
  ExperimentCompound,
  KineticSnapshot,
  Prediction,
} = require('../models');
const { computeMetrics, buildKineticChart, nextTimelineStep } = require('../utils/predictionEngine');

const includeRelations = [
  { model: Compound, as: 'compounds', through: { attributes: [] } },
  { model: KineticSnapshot, as: 'kineticSnapshots' },
  { model: Prediction, as: 'predictions', limit: 5, order: [['created_at', 'DESC']] },
];

const getUserExperiments = (userId) =>
  Experiment.findAll({
    where: { user_id: userId },
    include: includeRelations,
    order: [['updated_at', 'DESC']],
  });

const getExperimentById = async (id, userId) => {
  const experiment = await Experiment.findOne({
    where: { id, user_id: userId },
    include: includeRelations,
  });
  if (!experiment) {
    const err = new Error('Experimento no encontrado');
    err.status = 404;
    throw err;
  }
  return experiment;
};

const createExperiment = (userId, data = {}) =>
  Experiment.create({
    user_id: userId,
    title: data.title || 'Experimento de Catálisis',
    ...data,
  });

const updateExperiment = async (id, userId, data) => {
  const experiment = await getExperimentById(id, userId);
  await experiment.update(data);
  return experiment.reload({ include: includeRelations });
};

const deleteExperiment = async (id, userId) => {
  const experiment = await getExperimentById(id, userId);
  await experiment.destroy();
  return { message: 'Experimento eliminado' };
};

const addCompound = async (experimentId, userId, compoundId) => {
  const experiment = await getExperimentById(experimentId, userId);
  const compound = await Compound.findByPk(compoundId);
  if (!compound) {
    const err = new Error('Compuesto no encontrado');
    err.status = 404;
    throw err;
  }

  const exists = await ExperimentCompound.findOne({
    where: { experiment_id: experimentId, compound_id: compoundId },
  });
  if (!exists) {
    await ExperimentCompound.create({ experiment_id: experimentId, compound_id: compoundId });
    await experiment.update({
      conc_a: Math.min(1, Number(experiment.conc_a) + 0.1),
      pressure: Math.min(5, Number(experiment.pressure) + 0.3),
    });
  }

  return experiment.reload({ include: includeRelations });
};

const removeCompound = async (experimentId, userId, compoundId) => {
  const experiment = await getExperimentById(experimentId, userId);
  await ExperimentCompound.destroy({
    where: { experiment_id: experimentId, compound_id: compoundId },
  });
  return experiment.reload({ include: includeRelations });
};

const resetExperiment = async (id, userId) => {
  const experiment = await getExperimentById(id, userId);
  await ExperimentCompound.destroy({ where: { experiment_id: id } });
  await experiment.update({
    temperature: 298,
    pressure: 1.2,
    conc_a: 0.5,
    conc_b: 0.2,
    active_timeline_step: 'Mezcla',
    zoom_level: 1,
    show_grid: true,
  });
  return experiment.reload({ include: includeRelations });
};

const advanceStep = async (id, userId) => {
  const experiment = await getExperimentById(id, userId);
  const next = nextTimelineStep(experiment.active_timeline_step);
  await experiment.update({ active_timeline_step: next });
  return experiment.reload({ include: includeRelations });
};

const runPrediction = async (id, userId) => {
  const experiment = await getExperimentById(id, userId);
  const metrics = computeMetrics({
    temperature: experiment.temperature,
    pressure: experiment.pressure,
    concA: experiment.conc_a,
    concB: experiment.conc_b,
  });

  const prediction = await Prediction.create({
    experiment_id: id,
    user_id: userId,
    yield_percent: metrics.yieldPercent,
    stability_percent: metrics.stabilityPercent,
    energy_value: metrics.energyValue,
    atoms_count: metrics.atomsCount,
    risk_level: metrics.riskLevel,
    global_state: metrics.globalState,
    catalyst_efficiency: metrics.catalystEfficiency,
    enthalpy: metrics.enthalpy,
    entropy: metrics.entropy,
    accuracy_percent: metrics.accuracyPercent,
    estimated_time: metrics.estimatedTime,
  });

  await KineticSnapshot.destroy({ where: { experiment_id: id } });
  const chart = buildKineticChart(metrics.yieldPercent, metrics.stabilityPercent);
  await KineticSnapshot.bulkCreate(
    chart.map((row) => ({ ...row, experiment_id: id }))
  );

  return {
    metrics,
    prediction,
    experiment: await experiment.reload({ include: includeRelations }),
  };
};

const getOrCreateActiveExperiment = async (userId) => {
  let experiment = await Experiment.findOne({
    where: { user_id: userId, status: 'active' },
    include: includeRelations,
    order: [['updated_at', 'DESC']],
  });

  if (!experiment) {
    experiment = await createExperiment(userId);
    experiment = await experiment.reload({ include: includeRelations });
  }

  return experiment;
};

const { buildReportPayload, reportToCsv } = require('../utils/exportReport');

const getExportReport = async (id, userId, user) => {
  const experiment = await getExperimentById(id, userId);
  const report = buildReportPayload(experiment.toJSON(), user);
  const csv = reportToCsv(report);
  return { report, csv, filename: `chemsystem-cinetica-${id.slice(0, 8)}-${Date.now()}.csv` };
};

module.exports = {
  getUserExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  addCompound,
  removeCompound,
  resetExperiment,
  advanceStep,
  runPrediction,
  getOrCreateActiveExperiment,
  getExportReport,
};
