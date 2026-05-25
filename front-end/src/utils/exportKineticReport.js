const TIMELINE_STEPS = ['Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio'];

function escapeCsv(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function row(cells) {
  return cells.map(escapeCsv).join(',');
}

/** Genera CSV local cuando no hay API */
export function buildLocalKineticCsv({
  user,
  temperature,
  pressure,
  concA,
  concB,
  activeTimelineStep,
  yieldPercent,
  stabilityPercent,
  energyValue,
  atomsCount,
  globalState,
  riskLabel,
  catalystEfficiency,
  entalpia,
  entropia,
  workspaceReactants,
  kineticChart,
}) {
  const lines = [];
  const now = new Date().toISOString();

  lines.push('ChemSystem - Reporte Cinético de Reacción (exportación local)');
  lines.push(row(['Campo', 'Valor']));
  lines.push(row(['Fecha exportación', now]));
  lines.push(row(['Usuario', user?.name || 'Invitado']));
  lines.push(row(['Email', user?.email || '']));
  lines.push('');

  lines.push('Parámetros del simulador');
  lines.push(row(['Parámetro', 'Valor', 'Unidad']));
  lines.push(row(['Temperatura', temperature, 'K']));
  lines.push(row(['Presión', pressure, 'atm']));
  lines.push(row(['Reactivo A', concA, 'M']));
  lines.push(row(['Reactivo B', concB, 'M']));
  lines.push(row(['Paso timeline activo', activeTimelineStep, '']));
  lines.push('');

  lines.push('Métricas IA');
  lines.push(row(['Métrica', 'Valor']));
  lines.push(row(['Rendimiento', `${yieldPercent}%`]));
  lines.push(row(['Estabilidad', `${stabilityPercent}%`]));
  lines.push(row(['Energía', `${energyValue} eV`]));
  lines.push(row(['Átomos', atomsCount]));
  lines.push(row(['Estado global', globalState]));
  lines.push(row(['Riesgo', riskLabel]));
  lines.push(row(['Eficiencia catalizador', `${catalystEfficiency}%`]));
  lines.push(row(['Entalpía ΔH', `${entalpia} kJ/mol`]));
  lines.push(row(['Entropía ΔS', `${entropia} J/mol·K`]));
  lines.push('');

  lines.push('Línea de tiempo de reacción');
  lines.push(row(['Etapa', 'Estado']));
  const activeIdx = TIMELINE_STEPS.indexOf(activeTimelineStep);
  TIMELINE_STEPS.forEach((step, idx) => {
    const estado = idx === activeIdx ? 'activa' : idx < activeIdx ? 'completada' : 'pendiente';
    lines.push(row([step, estado]));
  });
  lines.push('');

  lines.push('Evolución de reacción predictiva');
  lines.push(row(['Tiempo', 'Rendimiento %', 'Estabilidad %', 'Predicción']));
  kineticChart.forEach((bar) => {
    lines.push(row([bar.t, bar.rend, bar.est, bar.prediction ? 'Sí' : 'No']));
  });
  lines.push('');

  lines.push('Reactivos en workspace');
  lines.push(row(['Código', 'Nombre', 'Etiqueta']));
  if (workspaceReactants.length) {
    workspaceReactants.forEach((r) => {
      lines.push(row([r.id, r.name, r.label]));
    });
  } else {
    lines.push(row(['Ninguno', '', '']));
  }

  return lines.join('\n');
}

export function downloadCsvFile(csvContent, filename) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
