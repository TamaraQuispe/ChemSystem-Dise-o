const { computeMetrics } = require('./predictionEngine');

const TIMELINE_STEPS = ['Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio'];

function escapeCsv(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function row(cells) {
  return cells.map(escapeCsv).join(',');
}

function buildReportPayload(experiment, user) {
  const metrics = computeMetrics({
    temperature: experiment.temperature,
    pressure: experiment.pressure,
    concA: experiment.conc_a,
    concB: experiment.conc_b,
  });

  const kinetic = (experiment.kineticSnapshots || [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((k) => ({
      tiempo: k.time_label,
      rendimiento_pct: k.yield_percent,
      estabilidad_pct: k.stability_percent,
      es_prediccion: k.is_prediction,
    }));

  const timeline = TIMELINE_STEPS.map((step) => ({
    etapa: step,
    estado: step === experiment.active_timeline_step ? 'activa' : 'inactiva',
    completada:
      TIMELINE_STEPS.indexOf(step) < TIMELINE_STEPS.indexOf(experiment.active_timeline_step),
  }));

  return {
    meta: {
      exportado_en: new Date().toISOString(),
      titulo: experiment.title,
      experimento_id: experiment.id,
      usuario: user?.name || 'Usuario',
      email: user?.email || '',
    },
    parametros: {
      temperatura_k: Number(experiment.temperature),
      presion_atm: Number(experiment.pressure),
      concentracion_reactivo_a_m: Number(experiment.conc_a),
      concentracion_reactivo_b_m: Number(experiment.conc_b),
      paso_timeline_activo: experiment.active_timeline_step,
      zoom: Number(experiment.zoom_level),
      grilla_visible: experiment.show_grid,
    },
    metricas: metrics,
    linea_de_tiempo: timeline,
    evolucion_cinetica: kinetic,
    reactivos: (experiment.compounds || []).map((c) => ({
      codigo: c.code,
      nombre: c.name,
      etiqueta: c.label,
      concentracion: c.concentration,
    })),
    ultima_prediccion: experiment.predictions?.[0] || null,
  };
}

function reportToCsv(report) {
  const lines = [];

  lines.push('ChemSystem - Reporte Cinético de Reacción');
  lines.push(row(['Campo', 'Valor']));
  lines.push(row(['Fecha exportación', report.meta.exportado_en]));
  lines.push(row(['Experimento', report.meta.titulo]));
  lines.push(row(['ID', report.meta.experimento_id]));
  lines.push(row(['Usuario', report.meta.usuario]));
  lines.push(row(['Email', report.meta.email]));
  lines.push('');

  lines.push('Parámetros del simulador');
  lines.push(row(['Parámetro', 'Valor', 'Unidad']));
  lines.push(row(['Temperatura', report.parametros.temperatura_k, 'K']));
  lines.push(row(['Presión', report.parametros.presion_atm, 'atm']));
  lines.push(row(['Reactivo A (H₂O)', report.parametros.concentracion_reactivo_a_m, 'M']));
  lines.push(row(['Reactivo B (O₂)', report.parametros.concentracion_reactivo_b_m, 'M']));
  lines.push(row(['Paso timeline activo', report.parametros.paso_timeline_activo, '']));
  lines.push('');

  lines.push('Métricas IA (calculadas)');
  lines.push(row(['Métrica', 'Valor']));
  lines.push(row(['Rendimiento', `${report.metricas.yieldPercent}%`]));
  lines.push(row(['Estabilidad', `${report.metricas.stabilityPercent}%`]));
  lines.push(row(['Energía', `${report.metricas.energyValue} eV`]));
  lines.push(row(['Átomos', report.metricas.atomsCount]));
  lines.push(row(['Estado global', report.metricas.globalState]));
  lines.push(row(['Riesgo', report.metricas.riskLevel]));
  lines.push(row(['Eficiencia catalizador', `${report.metricas.catalystEfficiency}%`]));
  lines.push(row(['Entalpía ΔH', `${report.metricas.enthalpy} kJ/mol`]));
  lines.push(row(['Entropía ΔS', `${report.metricas.entropy} J/mol·K`]));
  lines.push('');

  lines.push('Línea de tiempo de reacción');
  lines.push(row(['Etapa', 'Estado', 'Completada']));
  report.linea_de_tiempo.forEach((s) => {
    lines.push(row([s.etapa, s.estado, s.completada ? 'Sí' : 'No']));
  });
  lines.push('');

  lines.push('Evolución de reacción predictiva');
  lines.push(row(['Tiempo', 'Rendimiento %', 'Estabilidad %', 'Predicción']));
  if (report.evolucion_cinetica.length) {
    report.evolucion_cinetica.forEach((k) => {
      lines.push(row([k.tiempo, k.rendimiento_pct, k.estabilidad_pct, k.es_prediccion ? 'Sí' : 'No']));
    });
  } else {
    lines.push(row(['Sin datos en BD', '', '', '']));
  }
  lines.push('');

  lines.push('Reactivos en workspace');
  lines.push(row(['Código', 'Nombre', 'Etiqueta', 'Concentración']));
  if (report.reactivos.length) {
    report.reactivos.forEach((r) => {
      lines.push(row([r.codigo, r.nombre, r.etiqueta, r.concentracion]));
    });
  } else {
    lines.push(row(['Ninguno', '', '', '']));
  }

  return lines.join('\n');
}

module.exports = { buildReportPayload, reportToCsv, TIMELINE_STEPS };
