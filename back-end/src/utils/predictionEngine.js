/**
 * Motor de predicción IA - replica la lógica del frontend Simulators.jsx
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeMetrics({ temperature = 298, pressure = 1.2, concA = 0.5, concB = 0.2 }) {
  const temp = Number(temperature);
  const press = Number(pressure);
  const a = Number(concA);
  const b = Number(concB);

  const atomsCount = Math.round(1428 + (a + b) * 200 + press * 50);
  const energyValue = Number((-4.2 - (temp - 298) * 0.01 + press * 0.05 + a * 0.1).toFixed(1));
  const stabilityPercent = clamp(Math.round(94 - (temp - 298) * 0.2 - (press - 1.2) * 8 + (a - 0.5) * 4), 10, 99);
  const yieldPercent = clamp(Math.round(89 + (temp - 310) * -0.15 - (press - 1.2) * 5 + (0.5 - b) * 10), 10, 99);
  const catalystEfficiency = clamp(Math.round(75 + (temp - 298) * 0.1 + (1.2 - press) * 3), 10, 100);
  const enthalpy = Number((-285 + (temp - 298) * 0.1).toFixed(0));
  const entropy = Number((130 - (press - 1.2) * 10).toFixed(0));

  const globalState = stabilityPercent > 80 ? 'Estable' : stabilityPercent > 50 ? 'Advertencia' : 'Crítico';
  const riskLevel = stabilityPercent > 80 ? 'Bajo' : stabilityPercent > 50 ? 'Moderado' : 'Alto';
  const accuracyPercent = clamp(Math.round(85 + (stabilityPercent - 50) * 0.15 + (yieldPercent - 70) * 0.1), 70, 99);

  return {
    atomsCount,
    energyValue,
    stabilityPercent,
    yieldPercent,
    catalystEfficiency,
    enthalpy,
    entropy,
    globalState,
    riskLevel,
    accuracyPercent,
    estimatedTime: '2m 34s',
  };
}

function buildKineticChart(yieldPercent, stabilityPercent) {
  return [
    { time_label: '10s', yield_percent: 20, stability_percent: 95, is_prediction: false, order_index: 0 },
    { time_label: '30s', yield_percent: 42, stability_percent: 91, is_prediction: false, order_index: 1 },
    { time_label: '1m', yield_percent: 63, stability_percent: 85, is_prediction: false, order_index: 2 },
    { time_label: '1.5m', yield_percent: 78, stability_percent: 80, is_prediction: false, order_index: 3 },
    { time_label: '2m', yield_percent: yieldPercent, stability_percent: stabilityPercent, is_prediction: true, order_index: 4 },
  ];
}

const TIMELINE_STEPS = ['Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio'];

function nextTimelineStep(current) {
  const idx = TIMELINE_STEPS.indexOf(current);
  return TIMELINE_STEPS[(idx + 1) % TIMELINE_STEPS.length];
}

module.exports = { computeMetrics, buildKineticChart, nextTimelineStep, TIMELINE_STEPS };
