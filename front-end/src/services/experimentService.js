import api from './api';

/** Mapea compuesto de API al formato del UI */
export const mapCompoundToUI = (compound) => ({
  id: compound.code,
  compoundId: compound.id,
  name: compound.name,
  label: compound.label,
  qty: compound.concentration || '',
  color: compound.color_class || 'text-blue-500 bg-blue-50 border-blue-100',
  dot: compound.dot_class || 'bg-blue-500',
});

export const experimentService = {
  async getActive() {
    const res = await api.get('/experiments/active/current');
    return res.data;
  },

  async update(id, params) {
    const res = await api.put(`/experiments/${id}`, {
      temperature: params.temperature,
      pressure: params.pressure,
      conc_a: params.concA,
      conc_b: params.concB,
      active_timeline_step: params.activeTimelineStep,
      zoom_level: params.zoomLevel,
      show_grid: params.showGrid,
    });
    return res.data;
  },

  async addReactant(experimentId, compoundId) {
    const res = await api.post(`/experiments/${experimentId}/reactants`, { compound_id: compoundId });
    return res.data;
  },

  async removeReactant(experimentId, compoundId) {
    const res = await api.delete(`/experiments/${experimentId}/reactants/${compoundId}`);
    return res.data;
  },

  async reset(experimentId) {
    const res = await api.post(`/experiments/${experimentId}/reset`);
    return res.data;
  },

  async nextStep(experimentId) {
    const res = await api.post(`/experiments/${experimentId}/next-step`);
    return res.data;
  },

  async predict(experimentId) {
    const res = await api.post(`/experiments/${experimentId}/predict`);
    return res.data;
  },

  async computeLive(params) {
    const res = await api.post('/experiments/compute', {
      temperature: params.temperature,
      pressure: params.pressure,
      concA: params.concA,
      concB: params.concB,
    });
    return res.data;
  },

  async exportCsv(experimentId) {
    const filename = `chemsystem-cinetica-${new Date().toISOString().slice(0, 10)}.csv`;
    await api.download(`/experiments/${experimentId}/export?format=csv`, filename);
  },
};
