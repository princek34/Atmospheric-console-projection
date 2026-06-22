// Advanced Web Audio API Synthesizer for Atmospheric Sounds

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Keep it compatible
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleGlobalSound = (enabled: boolean) => {
  soundEnabled = enabled;
  if (enabled) {
    getAudioContext();
  }
};

export const isSoundEnabled = () => soundEnabled;

/**
 * Synthesizes a gentle crystalline twinkling bell sound for snowflakes appearing.
 * Combines high frequency sine waves with immediate decay to represent delicate ice crystals.
 */
export const playSnowflakeSound = (volume: number = 0.25) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Create oscillator and gain node
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Choose a random crystalline note (C6 to C8 range)
    const baseFreq = 800 + Math.random() * 1200;
    osc.type = 'sine';
    
    // Gently sweep frequency down representing the descent
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.3);
    
    // Ultra gentle fast decay envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio synthesis warning:', e);
  }
};

/**
 * Synthesizes a rubbery, ascending soft "whoosh" / "pop" sound for balloons appearing.
 * Implements a sweep of frequency over a brief period.
 */
export const playBalloonSound = (volume: number = 0.22) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Soft, rubbery triangle wave
    osc.type = 'triangle';
    
    // Pitch whoops upward from low frequency
    const startFreq = 160 + Math.random() * 60;
    const endFreq = 450 + Math.random() * 180;
    
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.28);
    
    // Soft volume envelope swell and decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.30);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.32);
  } catch (e) {
    console.warn('Audio synthesis warning:', e);
  }
};
