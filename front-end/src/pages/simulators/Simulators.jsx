import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChemSystem } from '../../hooks/useChemSystem';
import { experimentService, mapCompoundToUI } from '../../services/experimentService';

import { 
  LayoutDashboard, 
  FlaskConical, 
  BookOpen, 
  LineChart, 
  Users, 
  Settings, 
  HelpCircle, 
  Plus, 
  Search, 
  Zap, 
  Bell, 
  RotateCw, 
  Maximize2, 
  Grid,
  Droplet,
  Wind,
  Brain,
  TrendingUp,
  AlertCircle,
  HelpCircle as QuestionIcon,
  Trash2,
  ArrowRight,
  Sparkles,
  Menu,
  X,
  Download
} from 'lucide-react';
import { buildLocalKineticCsv, downloadCsvFile } from '../../utils/exportKineticReport';

const FALLBACK_REACTANTS = [
  { id: 'H2SO4', name: 'H₂SO₄', label: 'Ácido Sulfúrico', qty: '98%', color: 'text-blue-500 bg-blue-50 border-blue-100', dot: 'bg-blue-500' },
  { id: 'KMnO4', name: 'KMnO₄', label: 'Permanganato de Potasio', qty: '0.1 M', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'NaOH', name: 'NaOH', label: 'Hidróxido de Sodio', qty: '2.0 M', color: 'text-purple-500 bg-purple-50 border-purple-100', dot: 'bg-purple-500' },
];

const Simulators = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    user,
    experiment,
    stockReactants: apiStockReactants,
    recommendations,
    predictionHistory,
    unreadNotifications,
    apiConnected,
    loading,
    saveExperiment,
    addReactant: apiAddReactant,
    removeReactant: apiRemoveReactant,
    resetLab: apiResetLab,
    nextStep: apiNextStep,
    runPrediction: apiRunPrediction,
    searchCompounds,
  } = useChemSystem();

  // --- Simulation State ---
  const [temperature, setTemperature] = useState(298);
  const [pressure, setPressure] = useState(1.2);
  const [concA, setConcA] = useState(0.5);
  const [concB, setConcB] = useState(0.2);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTimelineStep, setActiveTimelineStep] = useState('Transición');
  const [workspaceReactants, setWorkspaceReactants] = useState([]);
  const [isHoveredReactant, setIsHoveredReactant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stockReactants = apiStockReactants.length > 0 ? apiStockReactants : FALLBACK_REACTANTS;

  // Sincronizar estado desde API al cargar
  useEffect(() => {
    if (!loading && apiConnected && !initialized) {
      experimentService.getActive().then((exp) => {
        if (exp) {
          setTemperature(Number(exp.temperature));
          setPressure(Number(exp.pressure));
          setConcA(Number(exp.conc_a));
          setConcB(Number(exp.conc_b));
          setActiveTimelineStep(exp.active_timeline_step);
          setZoomLevel(Number(exp.zoom_level));
          setShowGrid(exp.show_grid);
          if (exp.compounds?.length) {
            setWorkspaceReactants(exp.compounds.map(mapCompoundToUI));
          }
        }
        setInitialized(true);
      }).catch(() => setInitialized(true));
    } else if (!loading && !apiConnected) {
      setInitialized(true);
    }
  }, [loading, apiConnected, initialized]);

  // Persistir cambios de sliders al backend
  const persistParams = useCallback((overrides = {}) => {
    saveExperiment({
      temperature: overrides.temperature ?? temperature,
      pressure: overrides.pressure ?? pressure,
      concA: overrides.concA ?? concA,
      concB: overrides.concB ?? concB,
      activeTimelineStep: overrides.activeTimelineStep ?? activeTimelineStep,
      zoomLevel: overrides.zoomLevel ?? zoomLevel,
      showGrid: overrides.showGrid ?? showGrid,
    });
  }, [temperature, pressure, concA, concB, activeTimelineStep, zoomLevel, showGrid, saveExperiment]);

  useEffect(() => {
    if (!initialized || !apiConnected) return;
    persistParams();
  }, [initialized, apiConnected, temperature, pressure, concA, concB, activeTimelineStep, zoomLevel, showGrid, persistParams]);

  // Buscar compuestos en API
  useEffect(() => {
    if (!apiConnected) return;
    const timer = setTimeout(() => searchCompounds(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, apiConnected, searchCompounds]);

  // --- Computed IA Values based on sliders ---
  const atomsCount = Math.round(1428 + (concA + concB) * 200 + pressure * 50);
  const energyValue = (-4.2 - (temperature - 298) * 0.01 + pressure * 0.05 + concA * 0.1).toFixed(1);
  const stabilityPercent = Math.max(10, Math.min(99, Math.round(94 - (temperature - 298) * 0.2 - (pressure - 1.2) * 8 + (concA - 0.5) * 4)));
  
  // Predictive metrics
  const yieldPercent = Math.max(10, Math.min(99, Math.round(89 + (temperature - 310) * -0.15 - (pressure - 1.2) * 5 + (0.5 - concB) * 10)));
  const globalState = stabilityPercent > 80 ? 'Estable' : stabilityPercent > 50 ? 'Advertencia' : 'Crítico';
  const riskLabel = stabilityPercent > 80 ? 'Bajo' : stabilityPercent > 50 ? 'Moderado' : 'Alto';
  const riskColor = stabilityPercent > 80 ? 'text-[#059669] bg-[#EAFBF3]' : stabilityPercent > 50 ? 'text-[#D97706] bg-[#FEF3C7]' : 'text-[#DC2626] bg-[#FEE2E2]';
  const riskBadgeDot = stabilityPercent > 80 ? 'bg-[#059669]' : stabilityPercent > 50 ? 'bg-[#D97706]' : 'bg-[#DC2626]';
  
  // Catalyst efficiency circular metrics
  const catalystEfficiency = Math.max(10, Math.min(100, Math.round(75 + (temperature - 298) * 0.1 + (1.2 - pressure) * 3)));
  const entalpia = (-285 + (temperature - 298) * 0.1).toFixed(0);
  const entropia = (130 - (pressure - 1.2) * 10).toFixed(0);

  const kineticChartData = [
    { t: '10s', rend: 20, est: 95 },
    { t: '30s', rend: 42, est: 91 },
    { t: '1m', rend: 63, est: 85 },
    { t: '1.5m', rend: 78, est: 80 },
    { t: '2m', rend: yieldPercent, est: stabilityPercent, prediction: true },
  ];

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      if (apiConnected && experiment?.id) {
        await experimentService.exportCsv(experiment.id);
      } else {
        const csv = buildLocalKineticCsv({
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
          kineticChart: kineticChartData,
        });
        downloadCsvFile(csv, `chemsystem-cinetica-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error(err);
      alert(`No se pudo exportar: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Canvas Molecular Animation Reference
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Drag and Drop simulation handlers
  const handleAddReactant = async (react) => {
    if (!workspaceReactants.some(r => r.id === react.id)) {
      setWorkspaceReactants([...workspaceReactants, react]);
      setConcA(prev => Math.min(1.0, prev + 0.1));
      setPressure(prev => Math.min(5.0, prev + 0.3));
      const synced = await apiAddReactant(react, workspaceReactants);
      if (synced) {
        setConcA(synced.concA);
        setPressure(synced.pressure);
        setWorkspaceReactants(synced.workspaceReactants);
      }
    }
  };

  const handleClearLab = async () => {
    const synced = await apiResetLab();
    if (synced) {
      setWorkspaceReactants(synced.workspaceReactants);
      setTemperature(synced.temperature);
      setPressure(synced.pressure);
      setConcA(synced.concA);
      setConcB(synced.concB);
      setActiveTimelineStep(synced.activeTimelineStep);
    } else {
      setWorkspaceReactants([]);
      setTemperature(298);
      setPressure(1.2);
      setConcA(0.5);
      setConcB(0.2);
      setActiveTimelineStep('Mezcla');
    }
  };

  const handleNextStep = async () => {
    const synced = await apiNextStep();
    if (synced) {
      setActiveTimelineStep(synced.activeTimelineStep);
    } else {
      const steps = ['Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio'];
      const currentIndex = steps.indexOf(activeTimelineStep);
      setActiveTimelineStep(steps[(currentIndex + 1) % steps.length]);
    }
    await apiRunPrediction();
  };

  // --- Canvas 2D Glowing Molecular Physics Engine ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Molecular particles setup
    let particles = [];
    const particleCount = 28;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        // Color variation based on reactant concentration
        let pColor = 'rgba(56, 189, 248, 0.8)'; // Cyan
        if (i % 3 === 0) pColor = 'rgba(99, 102, 241, 0.8)'; // Indigo/Blue
        if (i % 5 === 0) pColor = 'rgba(168, 85, 247, 0.8)'; // Purple

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 5 + 4,
          color: pColor,
          glowColor: i % 3 === 0 ? 'rgba(56, 189, 248, 0.4)' : i % 5 === 0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(99, 102, 241, 0.4)',
          pulse: Math.random() * Math.PI
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw elegant Grid lines if toggled active
      if (showGrid) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40 * zoomLevel;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Adjust speed factor based on Temperature
      const tempSpeedFactor = (temperature / 298); 
      // Adjust collision density based on active step
      let behaviorGlow = 'rgba(6, 182, 212, 0.15)'; // Default Transition glow
      let bondingDistance = 85 * zoomLevel;
      let particleSpeed = 1 * tempSpeedFactor;

      if (activeTimelineStep === 'Mezcla') {
        bondingDistance = 50 * zoomLevel; // Minimal bonds
        behaviorGlow = 'rgba(14, 165, 233, 0.08)';
      } else if (activeTimelineStep === 'Activación') {
        bondingDistance = 95 * zoomLevel; // More interactions
        particleSpeed = 2.2 * tempSpeedFactor; // Energetic motion
        behaviorGlow = 'rgba(239, 68, 68, 0.12)';
      } else if (activeTimelineStep === 'Transición') {
        bondingDistance = 110 * zoomLevel; // Massive complex structures
        particleSpeed = 1.3 * tempSpeedFactor;
        behaviorGlow = 'rgba(168, 85, 247, 0.2)'; // Heavy purple glow
      } else if (activeTimelineStep === 'Producto') {
        bondingDistance = 75 * zoomLevel; // Stable grouped particles
        particleSpeed = 0.8 * tempSpeedFactor;
        behaviorGlow = 'rgba(16, 185, 129, 0.12)'; // Green stability
      } else if (activeTimelineStep === 'Equilibrio') {
        bondingDistance = 90 * zoomLevel;
        particleSpeed = 0.2; // Frozen lock state
        behaviorGlow = 'rgba(59, 130, 246, 0.15)';
      }

      // Draw reaction atmosphere backdrop glow in center
      const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height) / 2);
      grad.addColorStop(0, behaviorGlow);
      grad.addColorStop(1, 'rgba(10, 77, 122, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Physics & Draw Bonds (lines between nearby particles)
      ctx.lineWidth = 1.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Custom equilibrium constraint (particles settle into rows/grids)
        if (activeTimelineStep === 'Equilibrio') {
          const cols = 7;
          const targetX = ((i % cols) + 1) * (width / (cols + 1));
          const targetY = (Math.floor(i / cols) + 1) * (height / (Math.ceil(particleCount / cols) + 1));
          p1.x += (targetX - p1.x) * 0.05;
          p1.y += (targetY - p1.y) * 0.05;
        } else {
          // Standard kinetic motion
          p1.x += p1.vx * particleSpeed;
          p1.y += p1.vy * particleSpeed;

          // Boundary bouncing
          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;
          
          // Clamp bounds
          p1.x = Math.max(0, Math.min(width, p1.x));
          p1.y = Math.max(0, Math.min(height, p1.y));
        }

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < bondingDistance) {
            const alpha = (1 - dist / bondingDistance) * 0.65;
            
            // Neon glowing line
            ctx.strokeStyle = activeTimelineStep === 'Activación' ? `rgba(239, 68, 68, ${alpha})` : 
                              activeTimelineStep === 'Transición' ? `rgba(168, 85, 247, ${alpha})` : 
                              activeTimelineStep === 'Producto' ? `rgba(16, 185, 129, ${alpha})` : 
                              `rgba(56, 189, 248, ${alpha})`;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Sometime draw a little chemical energy spark on the bond
            if (activeTimelineStep === 'Activación' && Math.random() < 0.005) {
              ctx.fillStyle = '#FFF';
              ctx.beginPath();
              ctx.arc(p1.x - dx/2, p1.y - dy/2, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // 3. Draw Atoms (circles with radial glow gradients)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += 0.02;
        const currentRadius = p.radius * zoomLevel + Math.sin(p.pulse) * 0.8;

        // Spherical shadow/glow
        const radGlow = ctx.createRadialGradient(p.x, p.y, currentRadius * 0.1, p.x, p.y, currentRadius * 2.5);
        radGlow.addColorStop(0, '#FFFFFF');
        radGlow.addColorStop(0.2, p.color);
        radGlow.addColorStop(0.6, p.glowColor);
        radGlow.addColorStop(1, 'rgba(10, 77, 122, 0)');

        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid inner core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x - currentRadius*0.2, p.y - currentRadius*0.2, currentRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [temperature, pressure, concA, concB, activeTimelineStep, zoomLevel, showGrid]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0D2140] font-sans antialiased overflow-x-hidden">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[1.5px] z-50 lg:hidden cursor-pointer"
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside className={`w-72 bg-white border-r border-[#E2E8F0] h-screen flex flex-col p-6 fixed lg:sticky top-0 shrink-0 select-none z-50 transition-transform duration-300 left-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand identity */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[0.95rem] bg-[#0A4D7A] flex items-center justify-center text-white shadow-md shadow-[#0A4D7A]/15">
              <FlaskConical size={23} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#0A4D7A] tracking-tight leading-none mb-1">ChemSystem</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Nivel {user?.level ?? 14} · {(user?.xp ?? 1250).toLocaleString()} XP
                {apiConnected && <span className="ml-1 text-emerald-500">●</span>}
              </span>
            </div>
          </div>
          {/* Close X button inside drawer on mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-grow space-y-1.5 mt-2">
          {[
            { label: 'Panel Principal', icon: LayoutDashboard, path: '/home' },
            { label: 'Mis Módulos', icon: BookOpen, path: '/modules' },
            { label: 'Simuladores', icon: FlaskConical, path: '/simulators', active: true },
            { label: 'Rendimiento', icon: LineChart, path: '/analytics' },
            { label: 'Comunidad', icon: Users, path: '/community' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsMobileSidebarOpen(false);
                if (item.active) return;
                alert(`La sección "${item.label}" está simulada en esta versión independiente.`);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
                item.active 
                  ? 'bg-[#0A4D7A] text-white shadow-lg shadow-[#0A4D7A]/15 transform scale-[1.01]' 
                  : 'text-gray-400 hover:text-[#0A4D7A] hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} className={item.active ? 'text-white' : 'text-gray-400 group-hover:text-[#0A4D7A]'} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* Large Blue Experiment Button */}
          <div className="pt-6">
            <button 
              onClick={() => {
                setIsMobileSidebarOpen(false);
                handleClearLab();
                alert("Iniciando Nuevo Experimento de Catálisis...");
              }}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-md hover:shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3 font-extrabold text-sm transition-all duration-300 active:scale-98"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Nuevo Experimento</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-[#F1F5F9] space-y-1">
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false);
              alert("Abriendo configuración del simulador...");
            }}
            className="flex items-center gap-4 w-full px-4 py-2.5 text-gray-400 hover:text-[#0A4D7A] hover:bg-gray-50 rounded-2xl transition-all font-bold text-sm"
          >
            <Settings size={20} />
            <span>Configuración</span>
          </button>
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false);
              alert("Abriendo soporte y manual de laboratorio...");
            }}
            className="flex items-center gap-4 w-full px-4 py-2.5 text-gray-400 hover:text-[#0A4D7A] hover:bg-gray-50 rounded-2xl transition-all font-bold text-sm"
          >
            <HelpCircle size={20} />
            <span>Ayuda</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* 2. HEADER SUPERIOR */}
        <header className="h-20 sm:h-24 px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-[#E2E8F0] shrink-0 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Hamburger menu button for mobile/tablet */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-gray-50 border border-gray-150 hover:bg-gray-100 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Menu size={18} className="text-[#0D2140] stroke-[2.5]" />
            </button>
            
            <h1 className="text-lg sm:text-2xl font-black text-[#0D2140] tracking-tight truncate">Simulador de Catálisis</h1>
            <span className="bg-[#E6F9F1] text-[#059669] font-black px-2.5 sm:px-3.5 py-1 rounded-full text-[8px] sm:text-[9px] uppercase tracking-widest border border-green-200 shadow-sm leading-none flex items-center justify-center shrink-0">
              BETA LAB
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* Search compounds input (hidden on mobile to keep header clean) */}
            <div className="relative w-40 sm:w-64 hidden md:block">
              <input 
                type="text"
                placeholder="Buscar compuestos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F1F5F9] border border-transparent focus:border-blue-200 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-[#0D2140] placeholder-gray-400 outline-none transition-all"
              />
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 stroke-[2.2]" />
            </div>

            {/* Header minimal buttons */}
            <button className="p-2 sm:p-2.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
              <Zap size={17} className="text-gray-500 fill-gray-500" />
            </button>
            <button 
              title={unreadNotifications > 0 ? `${unreadNotifications} notificaciones` : 'Notificaciones'}
              className="p-2 sm:p-2.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl transition-all relative cursor-pointer"
            >
              <Bell size={17} className="text-gray-500" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>

            <div className="w-px h-6 sm:h-8 bg-gray-200" />

            {/* Circular Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 shrink-0 hover:scale-105 transition-all">
              <img 
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian'} 
                alt={user?.name || 'Usuario'} 
                className="w-full h-full" 
              />
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE DASHBOARD PANEL */}
        <main className="flex-grow p-4 sm:p-8 lg:p-10 overflow-y-auto space-y-8 lg:space-y-10 max-w-7xl mx-auto w-full">
          
          {/* TOP SECTION: GRID 3/4 VISUALIZER + 1/4 SLIDERS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* MOLECULAR VIEWER (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="relative rounded-[2.5rem] bg-[#021329] border border-cyan-950/20 overflow-hidden shadow-2xl flex-grow min-h-[460px] flex flex-col group">
                
                {/* Canvas Render backdrop */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair" />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex flex-col gap-2 max-w-[calc(100%-12rem)]">
                  <div className="bg-[#021F35]/80 backdrop-blur-md border border-emerald-500/20 text-[#10B981] text-[9px] sm:text-[10px] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shadow-lg leading-none uppercase tracking-widest self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping shrink-0" />
                    <span className="truncate">Reacción Activa</span>
                  </div>
                  <div className="text-blue-400 text-[8px] sm:text-[9px] font-bold tracking-widest leading-none bg-[#021F35]/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-blue-500/10 uppercase self-start truncate">
                    • IA Predictiva Activa
                  </div>
                </div>

                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                  <button 
                    onClick={() => alert("Abriendo foro de dudas en catálisis...")}
                    className="bg-[#0E0F3D]/80 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[8px] sm:text-[10px] font-black px-3 py-2 rounded-xl hover:bg-purple-950/90 transition-all flex items-center gap-2 shadow-lg tracking-widest uppercase cursor-pointer"
                  >
                    <QuestionIcon size={12} className="stroke-[2.5] shrink-0" />
                    <span>Dudas</span>
                  </button>
                </div>

                {/* Bottom Floating Stats Panel */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 rounded-[1.5rem] p-3 sm:p-5 sm:w-80 flex justify-between select-none">
                  <div className="text-center flex-1 border-r border-gray-100">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Átomos</p>
                    <p className="text-sm sm:text-2xl font-black text-[#0D2140] tracking-tight">{atomsCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center flex-1 border-r border-gray-100">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Energía</p>
                    <p className="text-sm sm:text-2xl font-black text-[#0D2140] tracking-tight">{energyValue} <span className="text-[9px] sm:text-xs font-bold text-gray-400">eV</span></p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estabilidad</p>
                    <p className="text-sm sm:text-2xl font-black text-[#059669] tracking-tight">{stabilityPercent}%</p>
                  </div>
                </div>

                {/* Floating Control Buttons */}
                <div className="absolute top-20 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-10 flex sm:flex-row flex-col gap-2">
                  {[
                    { icon: RotateCw, onClick: () => { setTemperature(298); setPressure(1.2); }, label: 'Refrescar' },
                    { icon: Maximize2, onClick: () => setZoomLevel(z => z === 1 ? 1.3 : z === 1.3 ? 0.75 : 1), label: 'Zoom' },
                    { icon: Grid, onClick: () => setShowGrid(!showGrid), label: 'Grid' },
                  ].map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={btn.onClick}
                      title={btn.label}
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-md text-[#0D2140] border border-gray-100 hover:bg-gray-50 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <btn.icon size={15} className="stroke-[2.2]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SLIDERS & ALERTS COLUMN (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-6">
              
              {/* IA Alerts Section - desde API */}
              <div className="space-y-3">
                {(recommendations.length > 0 ? recommendations : [
                  { type: 'tip', message: 'La IA recomienda aumentar la temperatura a 310 K' },
                  { type: 'success', message: 'Reducir concentración de O₂ mejorará la estabilidad global.' },
                ]).slice(0, 2).map((rec, idx) => (
                  <div 
                    key={rec.id || idx}
                    className={`rounded-[1.5rem] p-4 flex gap-3.5 shadow-sm border ${
                      rec.type === 'success' 
                        ? 'bg-[#EAFBF3] border-[#A7F3D0]' 
                        : rec.type === 'warning'
                          ? 'bg-[#FEF3C7] border-[#FDE68A]'
                          : 'bg-[#EBF7FF] border-[#BFDBFE]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md ${
                      rec.type === 'success' ? 'bg-[#059669] shadow-green-500/10' : 'bg-blue-500 shadow-blue-500/10'
                    }`}>
                      {rec.type === 'success' ? <Sparkles size={16} className="fill-white" /> : <Brain size={16} className="fill-white" />}
                    </div>
                    <p className={`text-xs font-bold leading-relaxed self-center ${
                      rec.type === 'success' ? 'text-[#065F46]' : 'text-[#1E3A8A]'
                    }`}>
                      {rec.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sliders Container Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 shadow-sm space-y-6 flex-grow flex flex-col justify-center">
                
                {/* 1. Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-black text-[#0D2140] tracking-wide">Temperatura</label>
                    <span className="text-lg font-black text-blue-600">{temperature} <span className="text-xs font-bold text-gray-400">K</span></span>
                  </div>
                  <input 
                    type="range" 
                    min="273" 
                    max="373" 
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#F1F5F9] rounded-lg appearance-none cursor-ew-resize accent-blue-600 outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span>273 K</span>
                    <span>373 K</span>
                  </div>
                </div>

                {/* 2. Pressure Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-black text-[#0D2140] tracking-wide">Presión</label>
                    <span className="text-lg font-black text-purple-600">{pressure.toFixed(1)} <span className="text-xs font-bold text-gray-400">atm</span></span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={Math.round(pressure * 10)}
                    onChange={(e) => setPressure(parseInt(e.target.value) / 10)}
                    className="w-full h-1.5 bg-[#F1F5F9] rounded-lg appearance-none cursor-ew-resize accent-purple-600 outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span>0 ATM</span>
                    <span>5 ATM</span>
                  </div>
                </div>

                {/* 3. Molar Concentrations */}
                <div className="space-y-3.5 pt-1 border-t border-[#F1F5F9]">
                  <h4 className="text-xs font-black text-[#0D2140] tracking-wide">Concentración Molar</h4>
                  
                  {/* Reactant A */}
                  <div className="flex flex-col gap-3 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100/50 transition-all select-none">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Droplet size={15} />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-xs font-black text-[#0D2140] mb-0.5">Reactivo A (H₂O)</span>
                          <span className="text-[9px] font-bold text-gray-400">Solución base</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-blue-600 shrink-0">{concA.toFixed(1)}M</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={Math.round(concA * 10)}
                      onChange={(e) => setConcA(parseInt(e.target.value) / 10)}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-ew-resize accent-blue-500 outline-none"
                    />
                  </div>

                  {/* Reactant B */}
                  <div className="flex flex-col gap-3 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100/50 transition-all select-none">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Wind size={15} />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-xs font-black text-[#0D2140] mb-0.5">Reactivo B (O₂)</span>
                          <span className="text-[9px] font-bold text-gray-400">Oxidador catalítico</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 shrink-0">{concB.toFixed(1)}M</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={Math.round(concB * 10)}
                      onChange={(e) => setConcB(parseInt(e.target.value) / 10)}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-ew-resize accent-emerald-500 outline-none"
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* MID SECTION: IA PREDICCIÓN & CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* EVO DE REACCIÓN PREDICTIVA CHART (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 sm:p-9 shadow-sm flex flex-col flex-grow relative overflow-hidden group">
                
                {/* Header title & Legends */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-black text-[#0D2140] tracking-tight">Evolución de Reacción Predictiva</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Cinética simulada en base al tiempo experimental</p>
                  </div>
                  
                  {/* Legends */}
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest select-none">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Rendimiento</span>
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Estabilidad</span>
                  </div>
                </div>

                {/* SVG/CSS Modern Flex bar chart */}
                <div className="flex-grow flex items-end justify-between h-48 pt-6 relative select-none">
                  
                  {/* Y-axis guide gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-gray-100/80" />
                    <div className="w-full h-px bg-gray-100/80" />
                    <div className="w-full h-px bg-gray-100/80" />
                    <div className="w-full h-px bg-gray-100/80" />
                  </div>

                  {/* Reactive Chart columns */}
                  {kineticChartData.map((bar, barIdx) => (
                    <div key={barIdx} className="flex-1 flex flex-col items-center gap-2 z-10 group/bar h-full justify-end">
                      
                      {/* Bar columns */}
                      <div className="w-16 sm:w-20 flex gap-1 h-full items-end justify-center relative">
                        {/* Hover values tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none shadow-xl z-20 flex flex-col items-center">
                          <span>R: {bar.rend}%</span>
                          <span>E: {bar.est}%</span>
                        </div>

                        {/* Prediction floating badge on last column */}
                        {bar.prediction && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-15 select-none animate-bounce">
                            <span className="bg-[#0A4D7A] text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                              Predicción
                            </span>
                          </div>
                        )}

                        {/* Rendimiento (Blue bar) */}
                        <div 
                          style={{ height: `${bar.rend}%` }}
                          className={`w-5 sm:w-6 transition-all duration-700 ease-out origin-bottom ${
                            bar.prediction 
                              ? 'bg-gradient-to-t from-blue-500/40 to-blue-500/20 border-2 border-dashed border-blue-500 rounded-t-lg'
                              : 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 rounded-t-lg shadow-md shadow-blue-500/10'
                          }`}
                        />

                        {/* Estabilidad (Green/Cyan bar) */}
                        <div 
                          style={{ height: `${bar.est}%` }}
                          className={`w-5 sm:w-6 transition-all duration-700 ease-out origin-bottom ${
                            bar.prediction
                              ? 'bg-gradient-to-t from-emerald-500/40 to-emerald-500/20 border-2 border-dashed border-emerald-500 rounded-t-lg'
                              : 'bg-gradient-to-t from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] rounded-t-lg shadow-md shadow-emerald-500/10'
                          }`}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{bar.t}</span>
                    </div>
                  ))}

                </div>

              </div>
            </div>

            {/* PREDICTIVE IA GLASS CARD (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#EAF5FF]/45 backdrop-blur-md border border-blue-100 rounded-[2.5rem] p-7 shadow-sm flex flex-col flex-grow relative overflow-hidden group">
                
                {/* Backdrop vector brain icon */}
                <Brain size={160} className="absolute right-[-40px] bottom-[-40px] text-blue-500/5 pointer-events-none rotate-12" />

                {/* Heading */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Brain size={18} className="fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0D2140] tracking-tight leading-none mb-1">Predicción IA</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Cálculo en la nube cuántica</span>
                  </div>
                </div>

                {/* Yield & Stability Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100/70 p-4 rounded-2xl flex flex-col shadow-sm">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rendimiento</span>
                    <span className="text-xl font-black text-blue-600 tracking-tight">{yieldPercent}%</span>
                  </div>
                  <div className="bg-white border border-gray-100/70 p-4 rounded-2xl flex flex-col shadow-sm">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Estabilidad</span>
                    <span className="text-xl font-black text-emerald-600 tracking-tight">{stabilityPercent > 75 ? 'Alta' : stabilityPercent > 45 ? 'Media' : 'Crítica'}</span>
                  </div>
                  <div className="bg-white border border-gray-100/70 p-4 rounded-2xl flex flex-col shadow-sm">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Tiempo Est.</span>
                    <span className="text-base font-black text-[#0D2140] tracking-tight">2m 34s</span>
                  </div>
                  <div className="bg-white border border-gray-100/70 p-4 rounded-2xl flex flex-col shadow-sm">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Riesgo Exp.</span>
                    <span className="text-base font-black text-[#0D2140] tracking-tight flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${stabilityPercent > 75 ? 'bg-green-500' : 'bg-red-500'}`} />
                      {riskLabel}
                    </span>
                  </div>
                </div>

                {/* Global active state badge */}
                <div className="mt-5">
                  <div className={`p-3.5 rounded-xl border border-transparent flex items-center gap-2.5 font-bold text-xs shadow-sm ${
                    globalState === 'Estable' ? 'bg-[#EAFBF3] text-[#059669] border-[#A7F3D0]/30' :
                    globalState === 'Advertencia' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]/30' :
                    'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]/30'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      globalState === 'Estable' ? 'bg-[#059669]' :
                      globalState === 'Advertencia' ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                    } animate-pulse`} />
                    <span>Estado Global: {globalState}</span>
                  </div>
                </div>

                {/* History list */}
                <div className="mt-6 pt-5 border-t border-blue-100/40">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Historial de Predicciones</h4>
                  <div className="space-y-2">
                    {(predictionHistory.length > 0 ? predictionHistory : [
                      { created_at: new Date().toISOString(), accuracy_percent: 92 },
                      { created_at: new Date(Date.now() - 7200000).toISOString(), accuracy_percent: 88 },
                    ]).slice(0, 3).map((pred, idx) => (
                      <div key={pred.id || idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500">
                          {new Date(pred.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-md shadow-sm">
                          {pred.accuracy_percent}% Acc.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* LOWER SECTION: TIMELINE + CATALYST CIRCULAR METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* REACTION TIMELINE (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 sm:p-9 shadow-sm flex flex-col justify-between flex-grow relative group">
                
                {/* Timeline Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-[#0D2140] tracking-tight">Línea de Tiempo de Reacción</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Seguimiento cinético en tiempo real</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="bg-gray-50 hover:bg-gray-100 text-[#0A4D7A] border border-[#E2E8F0] px-4.5 py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  >
                    <Download size={14} className="stroke-[2.5]" />
                    <span>{isExporting ? 'Exportando...' : 'Exportar Datos'}</span>
                  </button>
                </div>

                {/* Progress bar tracker timeline wrapper for horizontal scroll on mobile */}
                <div className="overflow-x-auto w-full scrollbar-none py-2">
                  <div className="relative py-12 px-6 flex items-center justify-between select-none min-w-[500px]">
                  
                  {/* Background Progress bar line */}
                  <div className="absolute left-6 right-6 h-1 bg-[#F1F5F9] rounded-full top-1/2 -translate-y-1/2 pointer-events-none" />

                  {/* Active completed colored line */}
                  <div 
                    style={{ 
                      width: activeTimelineStep === 'Mezcla' ? '0%' :
                             activeTimelineStep === 'Activación' ? '25%' :
                             activeTimelineStep === 'Transición' ? '50%' :
                             activeTimelineStep === 'Producto' ? '75%' : '100%' 
                    }}
                    className="absolute left-6 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out" 
                  />

                  {/* Timeline step elements */}
                  {[
                    { id: 'Mezcla', label: 'Mezcla' },
                    { id: 'Activación', label: 'Activación' },
                    { id: 'Transición', label: 'Transición' },
                    { id: 'Producto', label: 'Producto' },
                    { id: 'Equilibrio', label: 'Equilibrio' },
                  ].map((step, sIdx) => {
                    const steps = ['Mezcla', 'Activación', 'Transición', 'Producto', 'Equilibrio'];
                    const activeIndex = steps.indexOf(activeTimelineStep);
                    const currentIdx = steps.indexOf(step.id);
                    
                    const isCompleted = currentIdx < activeIndex;
                    const isActive = step.id === activeTimelineStep;

                    return (
                      <div 
                        key={sIdx} 
                        onClick={() => setActiveTimelineStep(step.id)}
                        className="flex flex-col items-center z-10 cursor-pointer group/step"
                      >
                        {/* Step glowing node */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isActive 
                            ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/20 scale-125' 
                            : isCompleted 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}>
                          {isActive ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          ) : isCompleted ? (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-200" />
                          )}
                        </div>

                        {/* Step title label */}
                        <span className={`text-[10px] font-black uppercase tracking-wider mt-4 transition-all duration-300 ${
                          isActive 
                            ? 'text-blue-600 scale-105' 
                            : 'text-gray-400 group-hover/step:text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}

                  </div>
                </div>

              </div>
            </div>

            {/* CATALYST EFFICIENCY CARD (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 shadow-sm flex flex-col justify-between flex-grow relative group">
                
                <h3 className="text-base font-black text-[#0D2140] tracking-tight leading-none mb-5">Eficiencia del Catalizador</h3>

                {/* Progress Wheel and Delta data */}
                <div className="flex items-center gap-6 select-none flex-grow justify-center py-2">
                  
                  {/* SVG Circular Progress */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="9" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke="#059669" 
                        strokeWidth="9" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - catalystEfficiency / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xl font-black text-[#0D2140]">{catalystEfficiency}%</span>
                  </div>

                  {/* Delta text */}
                  <div className="flex flex-col leading-snug">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rendimiento Actual</span>
                    <span className="text-2xl font-black text-emerald-600 tracking-tight">+12.4%</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">vs. Control Base</span>
                  </div>
                </div>

                {/* Entalpia & Entropia mini cards */}
                <div className="space-y-2.5 mt-4 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex justify-between items-center bg-[#FEF2F2] border border-[#FEE2E2] px-4.5 py-3 rounded-2xl">
                    <span className="text-[10px] font-black text-[#991B1B] uppercase tracking-wider">Entalpía (ΔH)</span>
                    <span className="text-xs font-black text-[#991B1B]">{entalpia} kJ/mol</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#EFF6FF] border border-[#DBEAFE] px-4.5 py-3 rounded-2xl">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Entropía (ΔS)</span>
                    <span className="text-xs font-black text-blue-700">{entropia} J/mol K</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* FINAL SECTION: REACTIVOS EN STOCK & DRAG AND DROP WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* REACTIVOS EN STOCK (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 shadow-sm flex flex-col flex-grow select-none">
                
                <h4 className="text-base font-black text-[#0D2140] tracking-tight mb-5">Reactivos en stock</h4>

                {/* Stock reactant items */}
                <div className="space-y-3.5">
                  {stockReactants.map((react, rIdx) => {
                    const isAdded = workspaceReactants.some(w => w.id === react.id);

                    return (
                      <div 
                        key={rIdx}
                        onClick={() => handleAddReactant(react)}
                        onMouseEnter={() => setIsHoveredReactant(react.id)}
                        onMouseLeave={() => setIsHoveredReactant(null)}
                        className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all cursor-pointer ${
                          isAdded 
                            ? 'bg-gray-50 border-gray-100 opacity-60' 
                            : 'bg-white border-[#E2E8F0] hover:border-blue-500 hover:shadow-md hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${react.color}`}>
                            <span className="text-xs font-black">{react.name[0]}</span>
                          </div>
                          <div className="flex flex-col leading-none">
                            <span className="text-xs font-black text-[#0D2140] mb-1">{react.name}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{react.label}</span>
                          </div>
                        </div>

                        {/* Add button or state */}
                        <div className="shrink-0">
                          {isAdded ? (
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En Lab</span>
                          ) : isHoveredReactant === react.id ? (
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Añadir +</span>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{react.qty}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* DRAG & DROP WORKSPACE (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-7 sm:p-9 shadow-sm flex flex-col justify-between flex-grow relative group overflow-hidden">
                
                {/* Backdrop design vector glow */}
                <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-[2.5rem] pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <h3 className="text-base font-black text-[#0D2140] tracking-tight">Espacio de Trabajo para Simulaciones</h3>
                  
                  {workspaceReactants.length > 0 && (
                    <button 
                      onClick={() => setWorkspaceReactants([])}
                      className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 border border-red-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Trash2 size={13} />
                      <span>Limpiar Workspace</span>
                    </button>
                  )}
                </div>

                {/* Drag drop dropzone container */}
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-[2rem] p-8 flex-grow flex flex-col items-center justify-center text-center relative hover:border-blue-500/50 transition-all py-10 select-none">
                  
                  {workspaceReactants.length > 0 ? (
                    // Reactants inside the workspace
                    <div className="flex flex-wrap items-center justify-center gap-4 z-10 animate-fade-in">
                      {workspaceReactants.map((react, wIdx) => (
                        <div 
                          key={wIdx} 
                          className="bg-white border border-gray-100 rounded-3xl p-4.5 pl-5 pr-6 shadow-md shadow-gray-200/50 flex items-center gap-3.5 animate-scale-in relative group/added"
                        >
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${react.color}`}>
                            <span className="text-xs font-black">{react.name[0]}</span>
                          </div>
                          <div className="flex flex-col leading-none text-left">
                            <span className="text-xs font-black text-[#0D2140] mb-0.5">{react.name}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{react.label}</span>
                          </div>

                          {/* Delete reactant button */}
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              setWorkspaceReactants(workspaceReactants.filter(r => r.id !== react.id));
                              await apiRemoveReactant(react);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-all cursor-pointer opacity-0 group-hover/added:opacity-100 scale-90 group-hover/added:scale-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Empty dropzone description
                    <div className="space-y-4 max-w-md z-10">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto shadow-sm text-blue-500">
                        <FlaskConical size={26} className="stroke-[2.2] animate-pulse" />
                      </div>
                      <h4 className="text-sm font-black text-[#0D2140]">Zona de Simulación Receptiva</h4>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed">
                        Haz clic en los reactivos en stock a la izquierda para cargarlos e iniciar una nueva secuencia de reacción molecular en el visualizador 3D.
                      </p>
                    </div>
                  )}

                </div>

                {/* Bottom button actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button 
                    onClick={handleClearLab}
                    className="bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#0D2140] font-extrabold px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                  >
                    Limpiar Lab
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="bg-[#0A4D7A] hover:bg-[#083E63] text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md shadow-[#0A4D7A]/10 flex items-center gap-2.5 active:scale-95 text-xs cursor-pointer"
                  >
                    <span>Siguiente Paso</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Simulators;
