const experimentService = require('../services/experimentService');
const { computeMetrics } = require('../utils/predictionEngine');

const list = async (req, res, next) => {
  try {
    const data = await experimentService.getUserExperiments(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getActive = async (req, res, next) => {
  try {
    const data = await experimentService.getOrCreateActiveExperiment(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await experimentService.getExperimentById(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await experimentService.createExperiment(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await experimentService.updateExperiment(req.params.id, req.user.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await experimentService.deleteExperiment(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const addReactant = async (req, res, next) => {
  try {
    const data = await experimentService.addCompound(req.params.id, req.user.id, req.body.compound_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const removeReactant = async (req, res, next) => {
  try {
    const data = await experimentService.removeCompound(req.params.id, req.user.id, req.params.compoundId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const reset = async (req, res, next) => {
  try {
    const data = await experimentService.resetExperiment(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const nextStep = async (req, res, next) => {
  try {
    const data = await experimentService.advanceStep(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const predict = async (req, res, next) => {
  try {
    const result = await experimentService.runPrediction(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const computeLive = async (req, res) => {
  const metrics = computeMetrics(req.body);
  res.json({ success: true, data: metrics });
};

const exportReport = async (req, res, next) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const { report, csv, filename } = await experimentService.getExportReport(
      req.params.id,
      req.user.id,
      req.user
    );

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.csv', '.json')}"`);
      return res.json(report);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM UTF-8 para Excel en español
    res.send('\uFEFF' + csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getActive,
  getOne,
  create,
  update,
  remove,
  addReactant,
  removeReactant,
  reset,
  nextStep,
  predict,
  computeLive,
  exportReport,
};
