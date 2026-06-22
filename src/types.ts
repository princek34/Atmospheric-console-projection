export interface Particle {
  id: string;
  type: 'snowflake' | 'balloon';
  left: number; // horizontal start position (percentage: 0 to 100)
  size: number; // width/height in px
  duration: number; // animation duration in seconds
  drift: number; // horizontal drift amount in px
  color?: string; // hex/tailwind color for balloons
  scale?: number; // scaling offset
  rotation?: number; // initial rotation or rotation speed
}

export type EffectType = 'snowflakes' | 'balloons';

export interface ActiveEffectState {
  active: boolean;
  timeLeft: number; // count down from 5.0 to 0
}
