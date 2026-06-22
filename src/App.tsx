import { useState, useEffect } from 'react';
import { Snowflake, Sparkles, Volume2, VolumeX, RotateCcw, Wind, Github } from 'lucide-react';
import ParticleStage from './components/ParticleStage';
import { Particle } from './types';
import { playSnowflakeSound, playBalloonSound, toggleGlobalSound, isSoundEnabled } from './utils/audio';

export default function App() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [snowEmitterEnd, setSnowEmitterEnd] = useState<number>(0);
  const [balloonEmitterEnd, setBalloonEmitterEnd] = useState<number>(0);
  const [snowTimeLeft, setSnowTimeLeft] = useState<number>(0);
  const [balloonTimeLeft, setBalloonTimeLeft] = useState<number>(0);
  const [localTime, setLocalTime] = useState<string>('');

  // Animation Calibration parameter states
  const [snowSpeed, setSnowSpeed] = useState<number>(1.0); // 0.2x to 3.0x (Default 1.0x = 5 seconds)
  const [snowQuantity, setSnowQuantity] = useState<number>(5); // 1 to 10 (Default 5)
  const [balloonSpeed, setBalloonSpeed] = useState<number>(1.0); // 0.2x to 3.0x (Default 1.0x = 5 seconds)
  const [balloonQuantity, setBalloonQuantity] = useState<number>(5); // 1 to 10 (Default 5)
  const [windIntensity, setWindIntensity] = useState<number>(0); // -30 to +30 knots, Default 0 (Calm)
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [audioTriggerIndicator, setAudioTriggerIndicator] = useState<boolean>(false);

  // Sync localized system clocks
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setLocalTime(`${h}:${m}:${s} GMT`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Control Audio Toggle
  const handleToggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    toggleGlobalSound(!nextMuted);
  };

  // Master simulation ticker (Runs every 100ms)
  useEffect(() => {
    let audioFlashTimeout: NodeJS.Timeout;

    const tick = setInterval(() => {
      const now = Date.now();
      let spawnedAny = false;

      // check Snowflakes Emit cycle
      if (snowEmitterEnd > now) {
        setSnowTimeLeft(Math.max(0, (snowEmitterEnd - now) / 1000));
        
        // Spawn intensity driven by quantity slider (5 is baseline = 1 per 100ms tick)
        const baseSpawnCount = Math.floor(snowQuantity / 5);
        const fractionalChance = (snowQuantity % 5) / 5;
        const spawnCount = baseSpawnCount + (Math.random() < fractionalChance ? 1 : 0);

        if (spawnCount > 0) {
          const newSnowflakes: Particle[] = [];
          for (let i = 0; i < spawnCount; i++) {
            // Speed controls duration multiplier: baseline duration is ~5s (4.25s + variation) at speed=1.0x
            const baseDuration = 5.0 / snowSpeed;
            // Introduce subtle organic duration drift representing aerodynamics
            const randomizedDuration = baseDuration * (0.86 + Math.random() * 0.28);

            newSnowflakes.push({
              id: `snow-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`,
              type: 'snowflake',
              left: Math.random() * 94 + 3,
              size: Math.random() * 6 + 19, // perfectly centered around medium size (19px - 25px)
              duration: Math.max(0.6, randomizedDuration),
              drift: (Math.random() * 10 - 5) + windIntensity,
              rotation: Math.random() * 360,
            });
          }
          setParticles((prev) => [...prev, ...newSnowflakes]);
          spawnedAny = true;

          // Play delicate mechanical crystalline chime sound
          if (!isAudioMuted) {
            playSnowflakeSound();
          }
        }
      } else {
        setSnowTimeLeft(0);
      }

      // check Balloons Emit cycle
      if (balloonEmitterEnd > now) {
        setBalloonTimeLeft(Math.max(0, (balloonEmitterEnd - now) / 1000));

        // Balloons spawn slightly less frequently to avoid screen crowding.
        // Baseline quantity 5 = spawns on 60% of ticks.
        const spawnWeight = balloonQuantity * 0.12; 
        const baseSpawnCount = Math.floor(spawnWeight);
        const fractionalChance = spawnWeight % 1;
        const spawnCount = baseSpawnCount + (Math.random() < fractionalChance ? 1 : 0);

        if (spawnCount > 0) {
          const newBalloons: Particle[] = [];
          const colors = [
            '#f59e0b', // Glowing Amber
            '#3b82f6', // Sapphire Cobalt
            '#14b8a6', // Bio-Teal
            '#10b981', // Emerald Ray
            '#f43f5e', // Coral Rose
            '#8b5cf6', // Violet Neon
            '#ec4899', // Hot Magenta
            '#6366f1', // Indigo Plasma
          ];

          for (let i = 0; i < spawnCount; i++) {
            const baseDuration = 5.0 / balloonSpeed;
            // Organic buoyancy drift
            const randomizedDuration = baseDuration * (0.84 + Math.random() * 0.32);

            newBalloons.push({
              id: `balloon-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`,
              type: 'balloon',
              left: Math.random() * 80 + 10,
              size: Math.random() * 10 + 46, // width centered around medium size (46px - 56px)
              duration: Math.max(0.7, randomizedDuration),
              drift: (Math.random() * 8 - 4) + (windIntensity * 0.75),
              color: colors[Math.floor(Math.random() * colors.length)],
              scale: Math.random() * 0.12 + 0.94,
            });
          }
          setParticles((prev) => [...prev, ...newBalloons]);
          spawnedAny = true;

          // Play custom satisfying rising rubber pop/whoosh sound
          if (!isAudioMuted) {
            playBalloonSound();
          }
        }
      } else {
        setBalloonTimeLeft(0);
      }

      if (spawnedAny && !isAudioMuted) {
        setAudioTriggerIndicator(true);
        clearTimeout(audioFlashTimeout);
        audioFlashTimeout = setTimeout(() => setAudioTriggerIndicator(false), 200);
      }
    }, 100);

    return () => {
      clearInterval(tick);
      clearTimeout(audioFlashTimeout);
    };
  }, [snowEmitterEnd, balloonEmitterEnd, snowSpeed, snowQuantity, balloonSpeed, balloonQuantity, windIntensity, isAudioMuted]);

  // Click triggers
  const triggerSnowflakes = () => {
    // Unsuspend audio context on interaction gesture
    toggleGlobalSound(!isAudioMuted);

    const end = Date.now() + 5000;
    setSnowEmitterEnd(end);
    
    // Direct initial payload to avoid state delay
    const initialWaveSize = Math.floor(snowQuantity * 1.2);
    const initialWave: Particle[] = Array.from({ length: initialWaveSize }).map((_, i) => {
      const baseDuration = 5.0 / snowSpeed;
      const randomizedDuration = baseDuration * (0.86 + Math.random() * 0.28);
      
      return {
        id: `snow-init-${i}-${Math.random().toString(36).substring(2, 5)}`,
        type: 'snowflake',
        left: Math.random() * 94 + 3,
        size: Math.random() * 6 + 19,
        duration: Math.max(0.6, randomizedDuration),
        drift: (Math.random() * 10 - 5) + windIntensity,
        rotation: Math.random() * 360,
      };
    });
    setParticles((prev) => [...prev, ...initialWave]);
    if (!isAudioMuted) {
      playSnowflakeSound(0.4);
    }
  };

  const triggerBalloons = () => {
    // Unsuspend audio context on interaction gesture
    toggleGlobalSound(!isAudioMuted);

    const end = Date.now() + 5000;
    setBalloonEmitterEnd(end);
    
    // Direct initial payload to avoid state delay
    const initialWaveSize = Math.floor(balloonQuantity * 1.0);
    const colors = [
      '#f59e0b', '#3b82f6', '#14b8a6', '#10b981', 
      '#f43f5e', '#8b5cf6', '#ec4899', '#6366f1'
    ];
    const initialWave: Particle[] = Array.from({ length: initialWaveSize }).map((_, i) => {
      const baseDuration = 5.0 / balloonSpeed;
      const randomizedDuration = baseDuration * (0.84 + Math.random() * 0.32);

      return {
        id: `balloon-init-${i}-${Math.random().toString(36).substring(2, 5)}`,
        type: 'balloon',
        left: Math.random() * 80 + 10,
        size: Math.random() * 10 + 46,
        duration: Math.max(0.7, randomizedDuration),
        drift: (Math.random() * 8 - 4) + (windIntensity * 0.75),
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: Math.random() * 0.12 + 0.94,
      };
    });
    setParticles((prev) => [...prev, ...initialWave]);
    if (!isAudioMuted) {
      playBalloonSound(0.4);
    }
  };

  // Immediate Reset Sequence
  const resetAllAnimations = () => {
    setParticles([]);
    setSnowEmitterEnd(0);
    setBalloonEmitterEnd(0);
    setSnowTimeLeft(0);
    setBalloonTimeLeft(0);
  };

  const handleParticleComplete = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const totalActiveSimulation = snowTimeLeft > 0 || balloonTimeLeft > 0;

  // Render Human-Friendly labels for slider positions
  const getQuantityLabel = (val: number) => {
    if (val <= 2) return 'Sparse';
    if (val <= 4) return 'Moderate';
    if (val <= 7) return 'Balanced';
    if (val <= 9) return 'Dense';
    return 'Hyper Stream';
  };

  const getSpeedLabel = (val: number) => {
    if (val === 1.0) return 'Standard (5.0s)';
    return `${val.toFixed(1)}x (${(5.0 / val).toFixed(1)}s descent)`;
  };

  const getWindDescription = (val: number) => {
    if (val === 0) return 'Calm (No drift)';
    if (val < 0) {
      if (val >= -10) return `Gentle Westward Breeze (${Math.abs(val)} knots)`;
      if (val >= -25) return `Moderate Westward Wind (${Math.abs(val)} knots)`;
      return `Strong Westward Gale (${Math.abs(val)} knots)`;
    } else {
      if (val <= 10) return `Gentle Eastward Breeze (${val} knots)`;
      if (val <= 25) return `Moderate Eastward Wind (${val} knots)`;
      return `Strong Eastward Gale (${val} knots)`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 font-serif flex flex-col justify-between overflow-hidden relative selection:bg-amber-600/30 selection:text-white">
      
      {/* Primary Stage rendering animated HTML5 Canvas SVG Particles */}
      <ParticleStage particles={particles} onParticleComplete={handleParticleComplete} />

      {/* Top Navigation Bar */}
      <nav className="h-20 border-b border-slate-900 flex items-center justify-between px-6 md:px-12 bg-slate-950/85 backdrop-blur-sm z-40 relative">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-amber-600/50 rotate-45 flex items-center justify-center bg-slate-900/60">
            <div className="w-4 h-4 bg-amber-600/20"></div>
          </div>
          <span className="tracking-[0.3em] text-xs uppercase font-sans text-slate-400 font-medium">Aetheris Systems</span>
        </div>
        <div className="hidden sm:flex gap-8 items-center text-[10px] uppercase tracking-[0.2em] font-sans">
          <span className="text-slate-500 hover:text-amber-500 cursor-help transition-colors">Diagnostics</span>
          <span className="text-slate-500 hover:text-amber-500 cursor-help transition-colors">Configuration</span>
          <a 
            href="https://github.com/princek34" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors font-medium border border-amber-500/20 px-3 py-1 bg-slate-900/40 rounded hover:border-amber-500/50"
            id="github-profile-nav-link"
          >
            <Github size={12} />
            GitHub: princek34
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative min-h-[600px] z-10 px-4 py-8">
        
        {/* Background Decorative Symmetric Grids */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.07] pointer-events-none z-0">
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-b border-slate-800"></div>
          
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-b border-slate-800"></div>
          
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-r border-b border-slate-800"></div>
          <div className="border-b border-slate-800"></div>
          
          <div className="border-r border-slate-800"></div>
          <div className="border-r border-slate-800"></div>
          <div className="border-r border-slate-800"></div>
          <div className="border-r border-slate-800"></div>
          <div className="border-r border-slate-800"></div>
          <div></div>
        </div>

        {/* Central Console Area */}
        <div className="z-10 text-center max-w-2xl w-full flex flex-col items-center">
          
          <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-2 text-white">
            Atmospheric Projection Console
          </h1>
          <p className="font-sans text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-10">
            Module Control Interface v.4.02.9
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 w-full mb-10">
            
            {/* Snowflakes Controller Button */}
            <div className="flex flex-col items-center gap-3 w-56">
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
              <button 
                id="trigger-snowflakes-button"
                onClick={triggerSnowflakes}
                className={`group relative w-full py-4.5 border transition-all duration-500 overflow-hidden cursor-pointer ${
                  snowTimeLeft > 0
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800 hover:border-amber-600/50'
                }`}
              >
                <span className={`relative z-10 font-sans text-xs uppercase tracking-[0.3em] transition-colors ${
                  snowTimeLeft > 0 ? 'text-amber-400 font-semibold' : 'text-slate-300 group-hover:text-amber-200'
                }`}>
                  Snowflakes
                </span>
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  snowTimeLeft > 0 ? 'bg-slate-900/90' : 'bg-slate-950 group-hover:bg-slate-900'
                }`}></div>
              </button>
              <span className="font-sans text-[9px] text-slate-500 uppercase tracking-widest italic">
                Precipitation Mode
              </span>
            </div>

            {/* Symmetrical Center Dot Ornament */}
            <div className="w-10 h-10 rounded-full border border-slate-900 flex items-center justify-center bg-slate-950/60 shadow-inner">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                totalActiveSimulation ? 'bg-amber-500 scale-125 animate-pulse' : 'bg-slate-700'
              }`}></div>
            </div>

            {/* Balloons Controller Button */}
            <div className="flex flex-col items-center gap-3 w-56">
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
              <button 
                id="trigger-balloons-button"
                onClick={triggerBalloons}
                className={`group relative w-full py-4.5 border transition-all duration-500 overflow-hidden cursor-pointer ${
                  balloonTimeLeft > 0
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800 hover:border-amber-600/50'
                }`}
              >
                <span className={`relative z-10 font-sans text-xs uppercase tracking-[0.3em] transition-colors ${
                  balloonTimeLeft > 0 ? 'text-amber-400 font-semibold' : 'text-slate-300 group-hover:text-amber-200'
                }`}>
                  Balloons
                </span>
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  balloonTimeLeft > 0 ? 'bg-slate-900/90' : 'bg-slate-950 group-hover:bg-slate-900'
                }`}></div>
              </button>
              <span className="font-sans text-[9px] text-slate-500 uppercase tracking-widest italic">
                Buoyancy Mode
              </span>
            </div>

          </div>

          {/* PARAMETER CALIBRATION PANEL */}
          <div className="w-full border border-slate-900 bg-slate-950/90 rounded-md p-6 backdrop-blur-sm shadow-2xl relative z-20 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Hardware Calibrator
              </span>
              <span className="font-mono text-[9px] text-slate-600">DYNAMICS DECK</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* SLIDERS COLUMN 1: SNOWFLAKE CONTROLS */}
              <div className="flex flex-col gap-5 p-3 rounded bg-slate-950/45 border border-slate-900/30">
                <h3 className="font-sans text-[10px] uppercase tracking-wider text-slate-300 font-bold border-b border-slate-900/80 pb-1.5 flex items-center gap-1.5">
                  <Snowflake size={11} className="text-sky-400" />
                  Snowflake Calibration
                </h3>
                
                {/* Snowflake Speed Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-sans">
                    <span className="text-slate-400">Snowflake Speed</span>
                    <span className="font-mono text-amber-500 font-semibold">{getSpeedLabel(snowSpeed)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={snowSpeed}
                    onChange={(e) => setSnowSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border-none outline-none focus:ring-0"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600">
                    <span>0.2x (Slow)</span>
                    <span>1.0x (Calibrated)</span>
                    <span>3.0x (Rapid)</span>
                  </div>
                </div>

                {/* Snowflake Quantity Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-sans">
                    <span className="text-slate-400">Snowflake Quantity</span>
                    <span className="font-mono text-sky-400 font-semibold">{getQuantityLabel(snowQuantity)} ({snowQuantity})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={snowQuantity}
                    onChange={(e) => setSnowQuantity(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border-none outline-none focus:ring-0"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600">
                    <span>1 (Sparse)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Blizzard)</span>
                  </div>
                </div>
              </div>

              {/* SLIDERS COLUMN 2: BALLOON CONTROLS */}
              <div className="flex flex-col gap-5 p-3 rounded bg-slate-950/45 border border-slate-900/30">
                <h3 className="font-sans text-[10px] uppercase tracking-wider text-slate-300 font-bold border-b border-slate-900/80 pb-1.5 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-rose-400" />
                  Balloon Calibration
                </h3>

                {/* Balloon Speed Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-sans">
                    <span className="text-slate-400">Balloon Speed</span>
                    <span className="font-mono text-amber-500 font-semibold">{getSpeedLabel(balloonSpeed)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={balloonSpeed}
                    onChange={(e) => setBalloonSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border-none outline-none focus:ring-0"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600">
                    <span>0.2x (Slow)</span>
                    <span>1.0x (Calibrated)</span>
                    <span>3.0x (Rapid)</span>
                  </div>
                </div>

                {/* Balloon Quantity Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-sans">
                    <span className="text-slate-400">Balloon Quantity</span>
                    <span className="font-mono text-rose-400 font-semibold">{getQuantityLabel(balloonQuantity)} ({balloonQuantity})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={balloonQuantity}
                    onChange={(e) => setBalloonQuantity(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border-none outline-none focus:ring-0"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600">
                    <span>1 (Sparse)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Festive)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* WIND PARAMETER SLIDER - FULL WIDTH */}
            <div className="mt-5 p-4 rounded bg-slate-950/45 border border-slate-900/30 flex flex-col gap-3">
              <h3 className="font-sans text-[10px] uppercase tracking-wider text-slate-300 font-bold border-b border-slate-900/80 pb-1.5 flex items-center gap-1.5 animate-pulse">
                <Wind size={11} className="text-emerald-400" />
                Global Wind Intensity Vector
              </h3>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-sans">
                  <span className="text-slate-400">Wind Velocity & Gradient</span>
                  <span className="font-mono text-amber-500 font-semibold">{getWindDescription(windIntensity)}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={windIntensity}
                  onChange={(e) => setWindIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 border-none outline-none focus:ring-0"
                  id="wind-intensity-slider"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-600">
                  <span>-30 Knots (Strong Westward Gale)</span>
                  <span>0 Knots (Calm Airs)</span>
                  <span>+30 Knots (Strong Eastward Gale)</span>
                </div>
              </div>
            </div>

            {/* AUDIO & SYSTEM COMMANDS CONTROL ROOM */}
            <div className="mt-6 pt-5 border-t border-slate-900 flex flex-col sm:flex-row items-center gap-4 justify-between">
              
              {/* Synthesizer audio indicators */}
              <div className="flex items-center gap-3">
                <button
                  id="toggle-audio-button"
                  onClick={handleToggleMute}
                  className={`flex items-center gap-2 px-3.5 py-1.5 border font-sans text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isAudioMuted 
                      ? 'border-slate-800 text-slate-500 hover:text-slate-300' 
                      : 'border-slate-800 text-amber-500 hover:border-amber-600/50 hover:bg-amber-950/10'
                  }`}
                >
                  {isAudioMuted ? (
                    <>
                      <VolumeX size={13} />
                      Synthesizer Muled
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} className={audioTriggerIndicator ? 'animate-bounce text-amber-400' : ''} />
                      Synthesizer Active
                    </>
                  )}
                </button>

                {/* Visual LED status indicators */}
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isAudioMuted ? 'bg-slate-800' : 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]'
                  }`} />
                  <span className="font-mono text-[8px] text-slate-600 uppercase">SYS_AUD_ON</span>
                </div>
              </div>

              {/* Reset Control Action Button */}
              <button
                id="reset-all-button"
                onClick={resetAllAnimations}
                className="w-full sm:w-auto px-4 py-1.5 border border-rose-950 hover:border-rose-800 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-200 font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={11} />
                Abort Motion / Reset System
              </button>

            </div>

          </div>

          {/* Dynamic Progress Indicator Countdown Gauges */}
          <div className="mt-8 w-full max-w-sm flex flex-col gap-3 font-sans">
            
            {snowTimeLeft > 0 && (
              <div id="snowflakes-countdown" className="border border-slate-900 bg-slate-950/80 p-4 rounded backdrop-blur-sm text-left">
                <div className="flex justify-between items-center text-xs tracking-wider text-slate-400 mb-2">
                  <span className="uppercase text-[9px] tracking-[0.15em] flex items-center gap-2 font-mono">
                    <span className="w-1 h-1 bg-sky-400 rounded-full animate-ping" />
                    Projection: Snow Stream active
                  </span>
                  <span className="font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                    {snowTimeLeft.toFixed(1)}s
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                  <div
                    className="bg-amber-600 h-full transition-all duration-100 ease-linear"
                    style={{ width: `${(snowTimeLeft / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {balloonTimeLeft > 0 && (
              <div id="balloons-countdown" className="border border-slate-900 bg-slate-950/80 p-4 rounded backdrop-blur-sm text-left">
                <div className="flex justify-between items-center text-xs tracking-wider text-slate-400 mb-2">
                  <span className="uppercase text-[9px] tracking-[0.15em] flex items-center gap-2 font-mono">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
                    Projection: Balloon Buoyant stream
                  </span>
                  <span className="font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                    {balloonTimeLeft.toFixed(1)}s
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                  <div
                    className="bg-amber-600 h-full transition-all duration-100 ease-linear"
                    style={{ width: `${(balloonTimeLeft / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!totalActiveSimulation && (
              <div id="simulation-idle-placeholder" className="border border-slate-900/40 bg-slate-920/10 p-4 rounded text-center">
                <p className="text-[9px] text-slate-600 uppercase tracking-widest select-none italic">
                  Systems in standby mode. Deploy atmospheric aesthetics.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Metric Side Panel Overlay HUD (Bottom Left) */}
        <div className="absolute bottom-10 left-6 md:left-12 hidden md:flex flex-col gap-2 font-sans opacity-50 z-10 text-left select-none">
          <div className="flex gap-4 items-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest w-26">Emitter Status</span>
            <span className="text-xs font-mono text-slate-300">
              {totalActiveSimulation ? 'Emanating Output' : 'Static Standby'}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest w-26">Active Particles</span>
            <span className="text-xs font-mono text-amber-500 font-semibold">{particles.length} active</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest w-26">Dac Dac Status</span>
            <span className="text-xs text-green-500 uppercase font-bold tracking-tighter">Synchronized</span>
          </div>
        </div>

      </main>

      {/* Bottom Metadata Bar */}
      <footer className="h-16 border-t border-slate-900 flex items-center justify-between px-6 md:px-12 text-[10px] tracking-[0.2em] text-slate-500 uppercase font-sans bg-slate-950 z-40 relative">
        <div className="hidden sm:block">
          <a 
            href="https://github.com/princek34" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
            id="github-profile-footer-link"
          >
            <Github size={12} className="text-amber-500" />
            GitHub: princek34
          </a>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-1.5 h-1.5 bg-amber-600/30 rounded-full animate-pulse"></div>
          <span>Authorized Console HUD</span>
          <div className="w-1.5 h-1.5 bg-amber-600/30 rounded-full animate-pulse"></div>
        </div>
        <div className="font-mono text-slate-400">{localTime}</div>
      </footer>

    </div>
  );
}
