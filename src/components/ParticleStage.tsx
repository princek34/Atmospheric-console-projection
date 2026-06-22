import { motion } from 'motion/react';
import { Snowflake } from 'lucide-react';
import { Particle } from '../types';

interface ParticleStageProps {
  particles: Particle[];
  onParticleComplete: (id: string) => void;
}

// Reusable elegant vector Balloon component with customizable color and glossy finish
function BalloonSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 100 150"
      style={{ width: size, height: size * 1.5 }}
      className="overflow-visible filter drop-shadow-md"
      id={`balloon-svg-${color.replace('#', '')}`}
    >
      {/* Balloon string - elegant curved trailing thread */}
      <path
        d="M50,90 C44,110 56,130 50,150"
        stroke="#94a3b8"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Balloon tie at the bottom */}
      <polygon
        points="44,90 56,90 50,83"
        fill={color}
      />

      {/* Balloon main body */}
      <path
        d="M50,10 C72,10 90,28 90,52 C90,75 75,90 50,90 C25,90 10,75 10,52 C10,28 28,10 50,10 Z"
        fill={color}
      />

      {/* Glossy highlight surface */}
      <ellipse
        cx="33"
        cy="33"
        rx="10"
        ry="15"
        fill="#ffffff"
        opacity="0.32"
        transform="rotate(-25 33 33)"
      />
    </svg>
  );
}

export default function ParticleStage({ particles, onParticleComplete }: ParticleStageProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {particles.map((particle) => {
        if (particle.type === 'snowflake') {
          return (
            <motion.div
              key={particle.id}
              id={`particle-snowflake-${particle.id}`}
              initial={{
                y: -60,
                x: `${particle.left}vw`,
                opacity: 0,
                rotate: particle.rotation || 0,
              }}
              animate={{
                y: '105vh',
                // Sinuous horizontal swing + directional wind drift effect
                x: [
                  `${particle.left}vw`,
                  `${particle.left + particle.drift * 0.25 + ((particle.id.charCodeAt(0) || 0) % 2 === 0 ? 2.5 : -2.5)}vw`,
                  `${particle.left + particle.drift * 0.50 + ((particle.id.charCodeAt(1) || 0) % 2 === 0 ? -2.5 : 2.5)}vw`,
                  `${particle.left + particle.drift * 0.75 + ((particle.id.charCodeAt(2) || 0) % 2 === 0 ? 1.5 : -1.5)}vw`,
                  `${particle.left + particle.drift}vw`,
                ],
                opacity: [0, 0.85, 0.85, 0.85, 0],
                rotate: [(particle.rotation || 0), (particle.rotation || 0) + 180, (particle.rotation || 0) + 360],
              }}
              transition={{
                y: { duration: particle.duration, ease: 'linear' },
                x: { duration: particle.duration, ease: 'easeInOut', repeat: 0 },
                opacity: { duration: particle.duration, ease: 'easeInOut', times: [0, 0.15, 0.5, 0.85, 1] },
                rotate: { duration: particle.duration, ease: 'linear' },
              }}
              onAnimationComplete={() => onParticleComplete(particle.id)}
              className="absolute pointer-events-none select-none text-sky-200"
              style={{
                width: particle.size,
                height: particle.size,
              }}
            >
              <Snowflake
                size={particle.size}
                strokeWidth={1.5}
                className="w-full h-full text-sky-300 opacity-90 drop-shadow-[0_1px_4px_rgba(186,230,253,0.5)]"
              />
            </motion.div>
          );
        } else {
          // Balloon animations
          return (
            <motion.div
              key={particle.id}
              id={`particle-balloon-${particle.id}`}
              initial={{
                y: '105vh',
                x: `${particle.left}vw`,
                opacity: 0,
                scale: particle.scale || 1,
              }}
              animate={{
                y: -150,
                // Soft sway + directional wind drift buoyancy effect
                x: [
                  `${particle.left}vw`,
                  `${particle.left + particle.drift * 0.25 + ((particle.id.charCodeAt(0) || 0) % 2 === 0 ? 2.0 : -2.0)}vw`,
                  `${particle.left + particle.drift * 0.50 + ((particle.id.charCodeAt(1) || 0) % 2 === 0 ? -2.0 : 2.0)}vw`,
                  `${particle.left + particle.drift * 0.75 + ((particle.id.charCodeAt(2) || 0) % 2 === 0 ? 1.0 : -1.0)}vw`,
                  `${particle.left + particle.drift}vw`,
                ],
                opacity: [0, 0.95, 0.95, 0.95, 0],
              }}
              transition={{
                y: { duration: particle.duration, ease: 'easeOut' },
                x: { duration: particle.duration, ease: 'easeInOut', repeat: 0 },
                opacity: { duration: particle.duration, ease: 'easeInOut', times: [0, 0.1, 0.5, 0.85, 1] },
              }}
              onAnimationComplete={() => onParticleComplete(particle.id)}
              className="absolute pointer-events-none select-none"
              style={{
                width: particle.size,
              }}
            >
              <BalloonSVG color={particle.color || '#6366f1'} size={particle.size} />
            </motion.div>
          );
        }
      })}
    </div>
  );
}
