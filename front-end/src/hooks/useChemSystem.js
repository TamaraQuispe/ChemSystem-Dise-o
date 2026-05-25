import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { experimentService, mapCompoundToUI } from '../services/experimentService';
import { dataService } from '../services/dataService';

/**
 * Hook que conecta el simulador con la API REST.
 * Mantiene fallback local si el backend no está disponible.
 */
export function useChemSystem() {
  const [user, setUser] = useState(null);
  const [experiment, setExperiment] = useState(null);
  const [stockReactants, setStockReactants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  const syncExperimentState = useCallback((exp) => {
    if (!exp) return null;
    setExperiment(exp);
    return {
      experimentId: exp.id,
      temperature: Number(exp.temperature),
      pressure: Number(exp.pressure),
      concA: Number(exp.conc_a),
      concB: Number(exp.conc_b),
      activeTimelineStep: exp.active_timeline_step,
      zoomLevel: Number(exp.zoom_level),
      showGrid: exp.show_grid,
      workspaceReactants: (exp.compounds || []).map(mapCompoundToUI),
      kineticSnapshots: exp.kineticSnapshots || [],
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        let token = localStorage.getItem('chemsystem_token');
        if (!token) {
          await authService.demoLogin();
        }
        const userData = await authService.me();
        const [exp, compounds, recs, preds, notifs] = await Promise.all([
          experimentService.getActive(),
          dataService.getCompounds(),
          dataService.getRecommendations(),
          dataService.getPredictions(),
          dataService.getNotifications(),
        ]);

        if (!mounted) return;
        setUser(userData);
        syncExperimentState(exp);
        setStockReactants(compounds);
        setRecommendations(recs);
        setPredictionHistory(preds);
        setUnreadNotifications(notifs.meta?.unreadCount || 0);
        setApiConnected(true);
      } catch (err) {
        console.warn('[ChemSystem] Modo offline - usando datos locales:', err.message);
        setApiConnected(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, [syncExperimentState]);

  const saveExperiment = useCallback((params) => {
    if (!apiConnected || !experiment?.id) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updated = await experimentService.update(experiment.id, params);
        setExperiment(updated);
      } catch (err) {
        console.warn('Error guardando experimento:', err.message);
      }
    }, 400);
  }, [apiConnected, experiment?.id]);

  const addReactant = useCallback(async (react, currentWorkspace) => {
    if (!apiConnected || !experiment?.id || !react.compoundId) {
      return null;
    }
    try {
      const updated = await experimentService.addReactant(experiment.id, react.compoundId);
      setExperiment(updated);
      return syncExperimentState(updated);
    } catch (err) {
      console.warn('Error añadiendo reactivo:', err.message);
      return null;
    }
  }, [apiConnected, experiment?.id, syncExperimentState]);

  const removeReactant = useCallback(async (react) => {
    if (!apiConnected || !experiment?.id || !react.compoundId) return;
    try {
      const updated = await experimentService.removeReactant(experiment.id, react.compoundId);
      setExperiment(updated);
      return syncExperimentState(updated);
    } catch (err) {
      console.warn('Error removiendo reactivo:', err.message);
    }
  }, [apiConnected, experiment?.id, syncExperimentState]);

  const resetLab = useCallback(async () => {
    if (!apiConnected || !experiment?.id) return null;
    try {
      const updated = await experimentService.reset(experiment.id);
      setExperiment(updated);
      return syncExperimentState(updated);
    } catch (err) {
      console.warn('Error reseteando:', err.message);
      return null;
    }
  }, [apiConnected, experiment?.id, syncExperimentState]);

  const nextStep = useCallback(async () => {
    if (!apiConnected || !experiment?.id) return null;
    try {
      const updated = await experimentService.nextStep(experiment.id);
      setExperiment(updated);
      return syncExperimentState(updated);
    } catch (err) {
      console.warn('Error avanzando paso:', err.message);
      return null;
    }
  }, [apiConnected, experiment?.id, syncExperimentState]);

  const runPrediction = useCallback(async () => {
    if (!apiConnected || !experiment?.id) return null;
    try {
      const result = await experimentService.predict(experiment.id);
      setExperiment(result.experiment);
      const preds = await dataService.getPredictions();
      setPredictionHistory(preds);
      return result.metrics;
    } catch (err) {
      console.warn('Error en predicción:', err.message);
      return null;
    }
  }, [apiConnected, experiment?.id]);

  const searchCompounds = useCallback(async (query) => {
    if (!apiConnected) return;
    try {
      const compounds = await dataService.getCompounds(query);
      setStockReactants(compounds);
    } catch (err) {
      console.warn('Error buscando compuestos:', err.message);
    }
  }, [apiConnected]);

  return {
    user,
    experiment,
    stockReactants,
    recommendations,
    predictionHistory,
    unreadNotifications,
    apiConnected,
    loading,
    saveExperiment,
    addReactant,
    removeReactant,
    resetLab,
    nextStep,
    runPrediction,
    searchCompounds,
  };
}
